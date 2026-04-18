import { createAnthropicProvider } from "./anthropic.ts";
import { createGeminiProvider } from "./gemini.ts";
import type { LLMProvider, LLMProviderName } from "./types.ts";

export type { LLMMessage, LLMResponse, LLMProvider, LLMProviderName } from "./types.ts";

export function resolveProviderName(): LLMProviderName {
  const raw = process.env.LEVEL2_PROVIDER?.trim().toLowerCase();
  if (raw === "anthropic") return "anthropic";
  if (raw === "gemini") return "gemini";
  // When LEVEL2_PROVIDER is unset, auto-detect from available API keys.
  // This makes the migration transition-safe: existing deployments with
  // only ANTHROPIC_API_KEY keep working, and new deployments that set
  // GEMINI_API_KEY before the env variable rolls out also work. Prefer
  // Gemini when both are present (the migration direction).
  if (process.env.GEMINI_API_KEY?.trim()) return "gemini";
  if (process.env.ANTHROPIC_API_KEY?.trim()) return "anthropic";
  // Neither key present: default to gemini so the missing-key error
  // message points at the recommended provider.
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
