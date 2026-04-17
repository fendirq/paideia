import { GoogleGenAI } from "@google/genai";
import type { LLMMessage, LLMProvider, LLMResponse } from "./types.ts";

const DEFAULT_PRIMARY = "gemini-3.1-pro-preview";
const DEFAULT_FALLBACK = "gemini-3-pro-preview";

export function resolveModels(): string[] {
  const primary = process.env.LEVEL2_GEMINI_MODEL?.trim() || DEFAULT_PRIMARY;
  const fallback =
    process.env.LEVEL2_GEMINI_FALLBACK_MODEL?.trim() || DEFAULT_FALLBACK;
  return fallback && fallback !== primary ? [primary, fallback] : [primary];
}

function supportsAdaptiveThinking(model: string): boolean {
  return model.startsWith("gemini-3") || model.startsWith("gemini-2.5");
}

/**
 * Gemini 3.x Pro preview and 2.5 Pro are thinking-only models — the API
 * rejects `thinkingBudget: 0` with HTTP 400 ("This model only works in
 * thinking mode"), and calling without any thinkingConfig allows internal
 * reasoning to consume the entire maxOutputTokens budget before producing
 * any user-visible text (finish_reason=MAX_TOKENS, content empty).
 *
 * For these models we MUST set thinkingBudget to -1 (auto) regardless of
 * whether the caller requested thinking explicitly. The `input.thinking`
 * hint is informational only — it cannot turn thinking off on a
 * thinking-only model. Temperature must also be omitted during thinking.
 */
function isThinkingOnlyModel(model: string): boolean {
  return supportsAdaptiveThinking(model);
}

function isTimeoutError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "TimeoutError") return true;
  if (err instanceof DOMException && err.name === "AbortError") return true;
  if (err instanceof Error) {
    if (err.name === "TimeoutError" || err.name === "AbortError") return true;
  }
  return false;
}

function errorStatus(err: unknown): number | undefined {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status: unknown }).status;
    if (typeof status === "number") return status;
  }
  return undefined;
}

function shouldFallback(err: unknown): boolean {
  const status = errorStatus(err);
  if (status !== undefined) {
    return status === 400 || status === 404 || status === 429 || status >= 500;
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("fetch failed") ||
      msg.includes("network") ||
      msg.includes("econnreset") ||
      msg.includes("enotfound")
    );
  }
  return false;
}

export function createGeminiProvider(apiKey: string): LLMProvider {
  const client = new GoogleGenAI({ apiKey });

  return {
    name: "gemini",
    async createLevel2Message(input: LLMMessage): Promise<LLMResponse> {
      const models = resolveModels();
      let lastError: unknown;

      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        try {
          const thinkingOnly = isThinkingOnlyModel(model);
          // On thinking-only models the API requires thinking and rejects
          // temperature; on older/flash models we honor the caller's hint
          // and pass temperature through.
          const useThinking = thinkingOnly || Boolean(input.thinking && supportsAdaptiveThinking(model));
          const response = await client.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: input.prompt }] }],
            config: {
              systemInstruction: input.system,
              maxOutputTokens: input.maxTokens,
              ...(!useThinking && input.temperature !== undefined
                ? { temperature: input.temperature }
                : {}),
              ...(useThinking ? { thinkingConfig: { thinkingBudget: -1 } } : {}),
              abortSignal: AbortSignal.timeout(input.timeoutMs),
            },
          });
          return { text: response.text ?? "", model };
        } catch (err) {
          lastError = err;
          const canRetry =
            i < models.length - 1 && !isTimeoutError(err) && shouldFallback(err);
          if (!canRetry) throw err;
          console.warn(
            `Level 2 ${input.stageLabel} failed on ${model}; retrying with ${models[i + 1]}.`,
            err,
          );
        }
      }

      throw lastError;
    },
  };
}
