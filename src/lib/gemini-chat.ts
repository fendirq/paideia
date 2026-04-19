// Gemini-backed tutor chat. Exposes the same public API as the old
// `together-chat.ts` (streamChatCompletion + chatCompletion) so the
// callers (chat route, thread-compression) don't need to change —
// except for the import path.
//
// The streaming output is re-formatted as OpenAI-style SSE frames so
// the existing transform in `src/app/api/sessions/[id]/chat/route.ts`
// and the SSE parser in `src/components/chat-container.tsx` continue
// to parse `data: {"choices":[{"delta":{"content":"..."}}]}` lines
// without modification.

import { GoogleGenAI } from "@google/genai";

// Default to `gemini-3-flash-preview` with thinking explicitly
// disabled (`thinkingBudget: 0`). The 3-series Flash is smarter
// than 2.5-flash at the same tier but is thinking-default — if
// we don't pass thinkingBudget:0 the tutor's first visible token
// is delayed by hundreds of internal reasoning tokens, which
// destroys the conversational UX. With thinking off, observed
// first-token latency is comparable to 2.5-flash (~200ms) with
// better reasoning quality. Upgradeable per-env via
// GEMINI_CHAT_MODEL — callers opting into a Pro-class model
// should leave thinkingBudget:0 in place or the response will
// stall (Pro-class rejects 0 with HTTP 400 — handled by the
// provider-wrapper abstraction, not here).
const DEFAULT_CHAT_MODEL = "gemini-3-flash-preview";

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

export async function streamChatCompletion(
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  const client = resolveClient();
  const model = getChatModel();
  const { system, turns } = splitMessages(messages);

  // Kick off the Gemini stream synchronously so any early auth /
  // config failure surfaces BEFORE we construct the ReadableStream —
  // the chat route catches this and cleans up the orphaned user
  // message.
  const iterator = await client.models.generateContentStream({
    model,
    contents: turns,
    config: {
      systemInstruction: system || undefined,
      maxOutputTokens: 2048,
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

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
        console.error("gemini-chat: stream failed", err);
        // Match the old together-chat behavior on mid-stream failure:
        // emit an error frame the client SSE parser surfaces as an
        // assistant message failure, then DONE so the loop exits.
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "AI service error. Please try again." })}\n\n`,
          ),
        );
        controller.enqueue(encoder.encode(DONE_FRAME));
      } finally {
        controller.close();
      }
    },
  });
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const client = resolveClient();
  const model = getChatModel();
  const { system, turns } = splitMessages(messages);

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
}
