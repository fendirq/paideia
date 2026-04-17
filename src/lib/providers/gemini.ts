import { GoogleGenAI } from "@google/genai";
import type { LLMMessage, LLMProvider, LLMResponse } from "./types";

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
          const useThinking = Boolean(input.thinking && supportsAdaptiveThinking(model));
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
