// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getChatModel, splitMessages } from "../lib/gemini-chat";

const ORIGINAL = process.env.GEMINI_CHAT_MODEL;

beforeEach(() => {
  delete process.env.GEMINI_CHAT_MODEL;
});

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.GEMINI_CHAT_MODEL;
  else process.env.GEMINI_CHAT_MODEL = ORIGINAL;
});

describe("getChatModel", () => {
  it("defaults to gemini-2.5-flash when no env override", () => {
    expect(getChatModel()).toBe("gemini-2.5-flash");
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
    // together-chat historically supported multiple system messages
    // in sequence; Gemini only accepts one systemInstruction, so we
    // join them.
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
