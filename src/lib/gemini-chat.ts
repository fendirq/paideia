// Gemini-backed tutor chat. Exposes `streamChatCompletion` and
// `chatCompletion` consumed by the chat route + thread compression.
//
// The streaming output is re-formatted as OpenAI-style SSE frames so
// the existing transform in `src/app/api/sessions/[id]/chat/route.ts`
// and the SSE parser in `src/components/chat-container.tsx` continue
// to parse `data: {"choices":[{"delta":{"content":"..."}}]}` lines
// without modification. This framing predates the Gemini migration —
// it stayed because rewriting the client-side SSE parser was out of
// scope.
//
// Model resolution: primary (`gemini-3-flash-preview` by default,
// thinking disabled) + stable fallback (`gemini-2.5-flash` GA).
// Either can be overridden per-env (GEMINI_CHAT_MODEL /
// GEMINI_CHAT_FALLBACK_MODEL). The fallback fires when the primary
// returns a retryable error BEFORE any tokens stream to the client —
// mid-stream failures still emit the legacy error frame because we
// can't rewind what the user already saw.

import { GoogleGenAI } from "@google/genai";

// Default to `gemini-3-flash-preview` with thinking explicitly
// disabled (`thinkingBudget: 0`). 3-series Flash is smarter than
// 2.5-flash at the same tier but is thinking-default — without
// thinkingBudget:0 the tutor's first visible token is gated behind
// hundreds of reasoning tokens, which destroys the conversational
// UX. With thinking off, observed TTFT is comparable to 2.5-flash
// (~200ms) with better reasoning quality.
const DEFAULT_CHAT_MODEL = "gemini-3-flash-preview";

// Stable GA fallback. Same prompt structure works; 2.5-flash is
// non-thinking-default so thinkingBudget:0 is redundant-but-safe
// there. Picked GA Flash (not Pro) because the tutor path is
// latency-critical — a thinking-only Pro model as fallback would
// mask preview-flakiness with multi-second TTFT.
const DEFAULT_FALLBACK_CHAT_MODEL = "gemini-2.5-flash";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GeminiTurn {
  role: "user" | "model";
  parts: { text: string }[];
}

interface SplitMessages {
  system: string;
  turns: GeminiTurn[];
}

export function getChatModel(): string {
  return process.env.GEMINI_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL;
}

/**
 * Resolve the ordered list of chat models to try. Returns primary
 * first, then fallback (unless primary == fallback, in which case
 * we collapse to a single-entry list to avoid a pointless retry).
 * Env override: GEMINI_CHAT_MODEL (primary), GEMINI_CHAT_FALLBACK_MODEL
 * (fallback). Set either to the same value — or unset FALLBACK — to
 * disable the fallback pathway entirely.
 */
export function getChatModels(): string[] {
  const primary = getChatModel();
  const fallback =
    process.env.GEMINI_CHAT_FALLBACK_MODEL?.trim() || DEFAULT_FALLBACK_CHAT_MODEL;
  return fallback && fallback !== primary ? [primary, fallback] : [primary];
}

function resolveClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey });
}

// Gemini takes system instructions via `systemInstruction`, not as a
// role="system" entry in `contents`. Concatenate all system messages
// and map assistant → "model" (Gemini's term for assistant turns).
export function splitMessages(messages: ChatMessage[]): SplitMessages {
  let system = "";
  const turns: GeminiTurn[] = [];
  for (const m of messages) {
    if (m.role === "system") {
      system = system ? `${system}\n\n${m.content}` : m.content;
    } else if (m.role === "user") {
      turns.push({ role: "user", parts: [{ text: m.content }] });
    } else if (m.role === "assistant") {
      turns.push({ role: "model", parts: [{ text: m.content }] });
    }
  }
  return { system, turns };
}

function openAiSse(delta: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`;
}

const DONE_FRAME = "data: [DONE]\n\n";

/**
 * Decide whether an error from a Gemini call is worth retrying on a
 * different model. Mirrors the logic in `src/lib/providers/gemini.ts`
 * (essay generation) — HTTP 4xx/5xx that indicate model-level trouble
 * + network-level failures retry; anything else surfaces.
 */
export function isRetryableChatError(err: unknown): boolean {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status: unknown }).status;
    if (typeof status === "number") {
      return status === 400 || status === 404 || status === 429 || status >= 500;
    }
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("fetch failed") ||
      msg.includes("network") ||
      msg.includes("econnreset") ||
      msg.includes("enotfound") ||
      msg.includes("timeout")
    );
  }
  return false;
}

export async function streamChatCompletion(
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  const client = resolveClient();
  const models = getChatModels();
  const { system, turns } = splitMessages(messages);

  // Try each model in sequence. The `generateContentStream` await
  // resolves BEFORE any tokens come back, so fallback here is safe —
  // the client hasn't seen anything yet. Mid-stream failures further
  // down still surface through the legacy error-frame path.
  let iterator: Awaited<
    ReturnType<GoogleGenAI["models"]["generateContentStream"]>
  > | null = null;
  let lastError: unknown;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      iterator = await client.models.generateContentStream({
        model,
        contents: turns,
        config: {
          systemInstruction: system || undefined,
          maxOutputTokens: 2048,
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      break;
    } catch (err) {
      lastError = err;
      const canRetry = i < models.length - 1 && isRetryableChatError(err);
      if (!canRetry) throw err;
      console.error("gemini-chat.stream: primary failed, trying fallback", {
        stage: "chat-stream",
        primary: model,
        fallback: models[i + 1],
        err: errorSummary(err),
      });
    }
  }

  if (!iterator) throw lastError;

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterator) {
          const text = chunk.text ?? "";
          if (text) controller.enqueue(encoder.encode(openAiSse(text)));
        }
        controller.enqueue(encoder.encode(DONE_FRAME));
      } catch (err) {
        console.error("gemini-chat: stream failed mid-stream", {
          stage: "chat-stream-midflight",
          err: errorSummary(err),
        });
        // On mid-stream failure: emit an error frame the client SSE
        // parser surfaces as an assistant message failure, then DONE
        // so the loop exits. We intentionally do NOT retry here —
        // the user has already seen partial output and switching
        // models mid-stream would produce an incoherent response.
        //
        // Branch the user-visible message: a SAFETY/RECITATION block
        // will loop forever if the user just retries, so the text has
        // to hint at rephrasing. Retryable errors (5xx, network) use
        // a generic retry message.
        const message = isSafetyBlockError(err)
          ? "This response was blocked. Try rephrasing your message."
          : "AI service error. Please try again.";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`),
        );
        controller.enqueue(encoder.encode(DONE_FRAME));
      } finally {
        controller.close();
      }
    },
  });
}

// Serializable summary for structured logs. Vercel renders `{err}` as
// "[object Object]" in the log aggregator, so we hand it a plain
// object with the fields humans actually care about.
function errorSummary(err: unknown): { name?: string; message?: string; status?: number } {
  if (err instanceof Error) {
    const status = (err as { status?: number }).status;
    return { name: err.name, message: err.message, status: typeof status === "number" ? status : undefined };
  }
  return { message: String(err) };
}

// Matches Gemini safety / recitation blocks, which are not retryable.
// Retrying the exact same prompt would hit the same classifier, so the
// user-visible message needs to nudge toward rephrasing, not retry.
function isSafetyBlockError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  if (msg.includes("safety") || msg.includes("blocked") || msg.includes("recitation")) {
    return true;
  }
  const finishReason = (err as { finishReason?: string }).finishReason;
  if (typeof finishReason === "string") {
    const r = finishReason.toUpperCase();
    if (r === "SAFETY" || r === "RECITATION" || r === "PROHIBITED_CONTENT") return true;
  }
  return false;
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const client = resolveClient();
  const models = getChatModels();
  const { system, turns } = splitMessages(messages);

  let lastError: unknown;
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const response = await client.models.generateContent({
        model,
        contents: turns,
        config: {
          systemInstruction: system || undefined,
          maxOutputTokens: 1024,
          temperature: 0.3,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      return response.text ?? "";
    } catch (err) {
      lastError = err;
      const canRetry = i < models.length - 1 && isRetryableChatError(err);
      if (!canRetry) throw err;
      console.error("gemini-chat.nonStream: primary failed, trying fallback", {
        stage: "chat-nonstream",
        primary: model,
        fallback: models[i + 1],
        err: errorSummary(err),
      });
    }
  }

  throw lastError;
}
