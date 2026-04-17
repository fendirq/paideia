// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getProvider, resolveProviderName } from "@/lib/providers";
import { resolveModels as resolveAnthropicModels } from "@/lib/providers/anthropic";
import { resolveModels as resolveGeminiModels } from "@/lib/providers/gemini";

const ENV_KEYS = [
  "LEVEL2_PROVIDER",
  "ANTHROPIC_API_KEY",
  "GEMINI_API_KEY",
  "ANTHROPIC_MODEL",
  "ANTHROPIC_LEVEL2_PRIMARY_MODEL",
  "ANTHROPIC_LEVEL2_FALLBACK_MODEL",
  "LEVEL2_GEMINI_MODEL",
  "LEVEL2_GEMINI_FALLBACK_MODEL",
] as const;

describe("provider factory", () => {
  const originalEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      originalEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnv[key];
      }
    }
  });

  describe("resolveProviderName", () => {
    it("defaults to anthropic when LEVEL2_PROVIDER is unset", () => {
      expect(resolveProviderName()).toBe("anthropic");
    });

    it("returns gemini when LEVEL2_PROVIDER=gemini", () => {
      process.env.LEVEL2_PROVIDER = "gemini";
      expect(resolveProviderName()).toBe("gemini");
    });

    it("is case-insensitive", () => {
      process.env.LEVEL2_PROVIDER = "GEMINI";
      expect(resolveProviderName()).toBe("gemini");
    });

    it("falls back to anthropic on unknown values", () => {
      process.env.LEVEL2_PROVIDER = "ollama";
      expect(resolveProviderName()).toBe("anthropic");
    });

    it("ignores surrounding whitespace", () => {
      process.env.LEVEL2_PROVIDER = "  gemini  ";
      expect(resolveProviderName()).toBe("gemini");
    });
  });

  describe("getProvider", () => {
    it("throws when anthropic is selected but ANTHROPIC_API_KEY is missing", () => {
      expect(() => getProvider("anthropic")).toThrow(/ANTHROPIC_API_KEY/);
    });

    it("throws when gemini is selected but GEMINI_API_KEY is missing", () => {
      expect(() => getProvider("gemini")).toThrow(/GEMINI_API_KEY/);
    });

    it("returns an anthropic provider when the key is present", () => {
      process.env.ANTHROPIC_API_KEY = "sk-ant-test";
      const provider = getProvider("anthropic");
      expect(provider.name).toBe("anthropic");
    });

    it("returns a gemini provider when the key is present", () => {
      process.env.GEMINI_API_KEY = "AQ.test";
      const provider = getProvider("gemini");
      expect(provider.name).toBe("gemini");
    });

    it("uses resolveProviderName() when no explicit name is passed", () => {
      process.env.LEVEL2_PROVIDER = "gemini";
      process.env.GEMINI_API_KEY = "AQ.test";
      const provider = getProvider();
      expect(provider.name).toBe("gemini");
    });
  });

  describe("anthropic model resolution", () => {
    it("reads ANTHROPIC_LEVEL2_PRIMARY_MODEL (matching existing route.ts env contract)", () => {
      process.env.ANTHROPIC_LEVEL2_PRIMARY_MODEL = "claude-custom-primary";
      expect(resolveAnthropicModels()[0]).toBe("claude-custom-primary");
    });

    it("falls back to ANTHROPIC_MODEL when primary is unset", () => {
      process.env.ANTHROPIC_MODEL = "claude-custom-legacy";
      expect(resolveAnthropicModels()[0]).toBe("claude-custom-legacy");
    });

    it("reads ANTHROPIC_LEVEL2_FALLBACK_MODEL for the fallback slot", () => {
      process.env.ANTHROPIC_LEVEL2_PRIMARY_MODEL = "claude-primary";
      process.env.ANTHROPIC_LEVEL2_FALLBACK_MODEL = "claude-fallback";
      expect(resolveAnthropicModels()).toEqual(["claude-primary", "claude-fallback"]);
    });

    it("defaults to opus-4-6 primary + sonnet-4-6 fallback", () => {
      expect(resolveAnthropicModels()).toEqual(["claude-opus-4-6", "claude-sonnet-4-6"]);
    });
  });

  describe("gemini model resolution", () => {
    it("reads LEVEL2_GEMINI_MODEL for the primary slot", () => {
      process.env.LEVEL2_GEMINI_MODEL = "gemini-custom";
      expect(resolveGeminiModels()[0]).toBe("gemini-custom");
    });

    it("reads LEVEL2_GEMINI_FALLBACK_MODEL for the fallback slot", () => {
      process.env.LEVEL2_GEMINI_MODEL = "gemini-primary";
      process.env.LEVEL2_GEMINI_FALLBACK_MODEL = "gemini-fallback";
      expect(resolveGeminiModels()).toEqual(["gemini-primary", "gemini-fallback"]);
    });

    it("defaults to gemini-3.1-pro-preview primary + gemini-3-pro-preview fallback", () => {
      expect(resolveGeminiModels()).toEqual(["gemini-3.1-pro-preview", "gemini-3-pro-preview"]);
    });
  });
});
