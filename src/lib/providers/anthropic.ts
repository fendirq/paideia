import Anthropic from "@anthropic-ai/sdk";
import type { LLMMessage, LLMProvider, LLMResponse } from "./types";

const DEFAULT_PRIMARY = "claude-opus-4-6";
const DEFAULT_FALLBACK = "claude-sonnet-4-6";

export function resolveModels(): string[] {
  const primary =
    process.env.ANTHROPIC_LEVEL2_PRIMARY_MODEL?.trim() ||
    process.env.ANTHROPIC_MODEL?.trim() ||
    DEFAULT_PRIMARY;
  const fallback =
    process.env.ANTHROPIC_LEVEL2_FALLBACK_MODEL?.trim() || DEFAULT_FALLBACK;
  return fallback && fallback !== primary ? [primary, fallback] : [primary];
}

function supportsAdaptiveThinking(model: string): boolean {
  return model.startsWith("claude-opus-4-6") || model.startsWith("claude-sonnet-4-6");
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function isTimeoutError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "TimeoutError") return true;
  if (err instanceof Error && err.name === "TimeoutError") return true;
  return false;
}

function shouldFallback(err: unknown): boolean {
  if (err instanceof Anthropic.APIConnectionError) return true;
  if (err instanceof Anthropic.APIError) {
    return (
      err.status === 400 ||
      err.status === 404 ||
      err.status === 429 ||
      (err.status !== undefined && err.status >= 500)
    );
  }
  return false;
}

export function createAnthropicProvider(apiKey: string): LLMProvider {
  const client = new Anthropic({ apiKey });

  return {
    name: "anthropic",
    async createLevel2Message(input: LLMMessage): Promise<LLMResponse> {
      const models = resolveModels();
      let lastError: unknown;

      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        try {
          const useThinking = Boolean(input.thinking && supportsAdaptiveThinking(model));
          const message = await client.messages.create(
            {
              model,
              max_tokens: input.maxTokens,
              ...(!useThinking && input.temperature !== undefined
                ? { temperature: input.temperature }
                : {}),
              system: input.system,
              messages: [{ role: "user", content: input.prompt }],
              ...(useThinking
                ? { thinking: { type: "adaptive", display: "omitted" } }
                : {}),
            },
            { signal: AbortSignal.timeout(input.timeoutMs) },
          );
          return { text: extractText(message), model };
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
