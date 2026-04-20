// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock is hoisted above top-level imports, so any references
// inside the factory must ALSO be hoisted via vi.hoisted. Without
// this, generateContentMock is undefined when the mock factory runs.
const { generateContentMock, generateContentStreamMock } = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
  generateContentStreamMock: vi.fn(),
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = {
      generateContent: generateContentMock,
      generateContentStream: generateContentStreamMock,
    };
  },
}));

import {
  chatCompletion,
  getChatModel,
  getChatModels,
  isRetryableChatError,
  splitMessages,
  streamChatCompletion,
} from "../lib/gemini-chat";

const ORIGINAL_MODEL = process.env.GEMINI_CHAT_MODEL;
const ORIGINAL_FALLBACK = process.env.GEMINI_CHAT_FALLBACK_MODEL;
const ORIGINAL_API_KEY = process.env.GEMINI_API_KEY;

beforeEach(() => {
  delete process.env.GEMINI_CHAT_MODEL;
  delete process.env.GEMINI_CHAT_FALLBACK_MODEL;
  process.env.GEMINI_API_KEY = "test-key";
  generateContentMock.mockReset();
  generateContentStreamMock.mockReset();
});

afterEach(() => {
  if (ORIGINAL_MODEL === undefined) delete process.env.GEMINI_CHAT_MODEL;
  else process.env.GEMINI_CHAT_MODEL = ORIGINAL_MODEL;
  if (ORIGINAL_FALLBACK === undefined)
    delete process.env.GEMINI_CHAT_FALLBACK_MODEL;
  else process.env.GEMINI_CHAT_FALLBACK_MODEL = ORIGINAL_FALLBACK;
  if (ORIGINAL_API_KEY === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = ORIGINAL_API_KEY;
});

describe("getChatModel", () => {
  it("defaults to gemini-3-flash-preview when no env override", () => {
    expect(getChatModel()).toBe("gemini-3-flash-preview");
  });
  it("honors GEMINI_CHAT_MODEL env override", () => {
    process.env.GEMINI_CHAT_MODEL = "gemini-3.1-pro-preview";
    expect(getChatModel()).toBe("gemini-3.1-pro-preview");
  });
  it("trims whitespace around the env override", () => {
    process.env.GEMINI_CHAT_MODEL = "  gemini-custom  ";
    expect(getChatModel()).toBe("gemini-custom");
  });
});

describe("getChatModels", () => {
  it("returns primary + fallback by default", () => {
    expect(getChatModels()).toEqual([
      "gemini-3-flash-preview",
      "gemini-2.5-flash",
    ]);
  });

  it("respects both GEMINI_CHAT_MODEL and GEMINI_CHAT_FALLBACK_MODEL overrides", () => {
    process.env.GEMINI_CHAT_MODEL = "primary-custom";
    process.env.GEMINI_CHAT_FALLBACK_MODEL = "fallback-custom";
    expect(getChatModels()).toEqual(["primary-custom", "fallback-custom"]);
  });

  it("collapses to single-entry list when primary == fallback", () => {
    process.env.GEMINI_CHAT_FALLBACK_MODEL = "gemini-3-flash-preview";
    expect(getChatModels()).toEqual(["gemini-3-flash-preview"]);
  });

  it("legacy override of just the primary still pairs it with the default fallback", () => {
    process.env.GEMINI_CHAT_MODEL = "gemini-2.5-flash";
    expect(getChatModels()).toEqual(["gemini-2.5-flash"]);
  });
});

describe("isRetryableChatError", () => {
  it("retries on 400/404/429/5xx HTTP statuses", () => {
    expect(isRetryableChatError({ status: 400 })).toBe(true);
    expect(isRetryableChatError({ status: 404 })).toBe(true);
    expect(isRetryableChatError({ status: 429 })).toBe(true);
    expect(isRetryableChatError({ status: 500 })).toBe(true);
    expect(isRetryableChatError({ status: 503 })).toBe(true);
  });

  it("does NOT retry on non-retryable 4xx statuses", () => {
    expect(isRetryableChatError({ status: 401 })).toBe(false);
    expect(isRetryableChatError({ status: 403 })).toBe(false);
  });

  it("retries on network-level error messages", () => {
    expect(isRetryableChatError(new Error("fetch failed"))).toBe(true);
    expect(isRetryableChatError(new Error("ECONNRESET"))).toBe(true);
    expect(isRetryableChatError(new Error("network timeout"))).toBe(true);
    expect(isRetryableChatError(new Error("ENOTFOUND api.google.com"))).toBe(true);
  });

  it("does not retry on unknown error shapes", () => {
    expect(isRetryableChatError(undefined)).toBe(false);
    expect(isRetryableChatError(null)).toBe(false);
    expect(isRetryableChatError("some string")).toBe(false);
    expect(isRetryableChatError(new Error("whatever"))).toBe(false);
  });
});

describe("chatCompletion — SDK config assertions", () => {
  it("sends thinkingBudget:0 and the primary model on success", async () => {
    generateContentMock.mockResolvedValue({ text: "hello" });
    const out = await chatCompletion([{ role: "user", content: "hi" }]);
    expect(out).toBe("hello");
    expect(generateContentMock).toHaveBeenCalledTimes(1);
    const callArg = generateContentMock.mock.calls[0][0];
    expect(callArg.model).toBe("gemini-3-flash-preview");
    expect(callArg.config.thinkingConfig).toEqual({ thinkingBudget: 0 });
    expect(callArg.config.temperature).toBe(0.3);
    expect(callArg.config.maxOutputTokens).toBe(1024);
  });

  it("falls back to the secondary model on a 500 and still sends thinkingBudget:0", async () => {
    generateContentMock
      .mockRejectedValueOnce(Object.assign(new Error("boom"), { status: 500 }))
      .mockResolvedValueOnce({ text: "hello from fallback" });
    const out = await chatCompletion([{ role: "user", content: "hi" }]);
    expect(out).toBe("hello from fallback");
    expect(generateContentMock).toHaveBeenCalledTimes(2);
    expect(generateContentMock.mock.calls[0][0].model).toBe("gemini-3-flash-preview");
    expect(generateContentMock.mock.calls[1][0].model).toBe("gemini-2.5-flash");
    // thinkingBudget:0 on BOTH calls — 2.5-flash accepts it harmlessly,
    // but the contract is that every call explicitly disables thinking.
    expect(generateContentMock.mock.calls[0][0].config.thinkingConfig).toEqual({
      thinkingBudget: 0,
    });
    expect(generateContentMock.mock.calls[1][0].config.thinkingConfig).toEqual({
      thinkingBudget: 0,
    });
  });

  it("surfaces the primary error when it is not retryable (401 auth)", async () => {
    const authErr = Object.assign(new Error("unauthorized"), { status: 401 });
    generateContentMock.mockRejectedValueOnce(authErr);
    await expect(
      chatCompletion([{ role: "user", content: "hi" }]),
    ).rejects.toThrow("unauthorized");
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });
});

describe("streamChatCompletion — SDK config assertions", () => {
  async function* emptyStream(): AsyncGenerator<{ text: string }> {
    yield { text: "ok" };
  }

  it("sends thinkingBudget:0 and the primary model on success", async () => {
    generateContentStreamMock.mockResolvedValue(emptyStream());
    const stream = await streamChatCompletion([
      { role: "user", content: "hi" },
    ]);
    // Consume the stream to ensure the async work runs.
    const reader = stream.getReader();
    while (!(await reader.read()).done) {
      /* drain */
    }
    expect(generateContentStreamMock).toHaveBeenCalledTimes(1);
    const callArg = generateContentStreamMock.mock.calls[0][0];
    expect(callArg.model).toBe("gemini-3-flash-preview");
    expect(callArg.config.thinkingConfig).toEqual({ thinkingBudget: 0 });
    expect(callArg.config.temperature).toBe(0.7);
    expect(callArg.config.maxOutputTokens).toBe(2048);
  });

  it("falls back to secondary model when the primary errors on setup", async () => {
    generateContentStreamMock
      .mockRejectedValueOnce(Object.assign(new Error("boom"), { status: 503 }))
      .mockResolvedValueOnce(emptyStream());
    const stream = await streamChatCompletion([
      { role: "user", content: "hi" },
    ]);
    const reader = stream.getReader();
    while (!(await reader.read()).done) {
      /* drain */
    }
    expect(generateContentStreamMock).toHaveBeenCalledTimes(2);
    expect(generateContentStreamMock.mock.calls[0][0].model).toBe(
      "gemini-3-flash-preview",
    );
    expect(generateContentStreamMock.mock.calls[1][0].model).toBe(
      "gemini-2.5-flash",
    );
  });

  it("does NOT fall back on non-retryable error (401 auth)", async () => {
    const authErr = Object.assign(new Error("unauthorized"), { status: 401 });
    generateContentStreamMock.mockRejectedValueOnce(authErr);
    await expect(
      streamChatCompletion([{ role: "user", content: "hi" }]),
    ).rejects.toThrow("unauthorized");
    expect(generateContentStreamMock).toHaveBeenCalledTimes(1);
  });
});

describe("splitMessages", () => {
  it("hoists system messages into systemInstruction, maps assistant→model", () => {
    const { system, turns } = splitMessages([
      { role: "system", content: "You are a tutor." },
      { role: "user", content: "Help me." },
      { role: "assistant", content: "Sure — what's the topic?" },
      { role: "user", content: "Essay structure." },
    ]);
    expect(system).toBe("You are a tutor.");
    expect(turns).toEqual([
      { role: "user", parts: [{ text: "Help me." }] },
      { role: "model", parts: [{ text: "Sure — what's the topic?" }] },
      { role: "user", parts: [{ text: "Essay structure." }] },
    ]);
  });

  it("concatenates multiple system messages with blank-line separators", () => {
    // Callers sometimes send multiple system messages; Gemini only
    // accepts one `systemInstruction`, so we join them with a
    // blank-line separator.
    const { system } = splitMessages([
      { role: "system", content: "Base persona." },
      { role: "system", content: "Extra context." },
      { role: "user", content: "go" },
    ]);
    expect(system).toBe("Base persona.\n\nExtra context.");
  });

  it("handles an empty input", () => {
    expect(splitMessages([])).toEqual({ system: "", turns: [] });
  });

  it("works with no system message", () => {
    const { system, turns } = splitMessages([
      { role: "user", content: "hi" },
    ]);
    expect(system).toBe("");
    expect(turns).toEqual([{ role: "user", parts: [{ text: "hi" }] }]);
  });
});
