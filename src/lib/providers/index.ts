import { createAnthropicProvider } from "./anthropic";
import { createGeminiProvider } from "./gemini";
import type { LLMProvider, LLMProviderName } from "./types";

export type { LLMMessage, LLMResponse, LLMProvider, LLMProviderName } from "./types";

export function resolveProviderName(): LLMProviderName {
  const raw = process.env.LEVEL2_PROVIDER?.trim().toLowerCase();
  if (raw === "gemini") return "gemini";
  return "anthropic";
}

export function getProvider(name: LLMProviderName = resolveProviderName()): LLMProvider {
  if (name === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is required when LEVEL2_PROVIDER=gemini. Set it in .env.local.",
      );
    }
    return createGeminiProvider(apiKey);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is required when LEVEL2_PROVIDER=anthropic. Set it in .env.local.",
    );
  }
  return createAnthropicProvider(apiKey);
}
