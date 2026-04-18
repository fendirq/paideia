import { createAnthropicProvider } from "./anthropic.ts";
import { createGeminiProvider } from "./gemini.ts";
import type { LLMProvider, LLMProviderName } from "./types.ts";

export type { LLMMessage, LLMResponse, LLMProvider, LLMProviderName } from "./types.ts";

export function resolveProviderName(): LLMProviderName {
  const raw = process.env.LEVEL2_PROVIDER?.trim().toLowerCase();
  if (raw === "anthropic") return "anthropic";
  // Default to Gemini post-migration. Environments that never set
  // LEVEL2_PROVIDER should still work as long as GEMINI_API_KEY is
  // configured. Anthropic stays available as an explicit opt-in for
  // emergency fallback via the dormant provider wrapper.
  return "gemini";
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
