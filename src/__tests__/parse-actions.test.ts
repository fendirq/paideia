import { describe, expect, it } from "vitest";
import { parseActionsFromResponse, splitActions } from "@/lib/parse-actions";

describe("splitActions", () => {
  it("splits the standard ACTIONS separator", () => {
    const result = splitActions("Hello there\n---ACTIONS---\n[One]\n[Two]");

    expect(result.before).toContain("Hello there");
    expect(result.after).toContain("[One]");
  });

  it("splits shortened ACT separators emitted by the model", () => {
    const result = splitActions("Explanation first\n---ACT---\n[Try again]\n[See example]");

    expect(result.before).toBe("Explanation first");
    expect(result.after).toContain("[Try again]");
  });
});

describe("parseActionsFromResponse", () => {
  it("parses suggestions from shortened ACT separators", () => {
    const result = parseActionsFromResponse(
      "Let’s work through one example.\n---ACT---\n[Walk me through the next step]\n[Give me another example]\n[Quiz me]"
    );

    expect(result.message).toBe("Let’s work through one example.");
    expect(result.suggestedActions).toEqual([
      "Walk me through the next step",
      "Give me another example",
      "Quiz me",
    ]);
  });

  it("returns the whole message when no separator exists", () => {
    const result = parseActionsFromResponse("Plain response only.");

    expect(result).toEqual({
      message: "Plain response only.",
      suggestedActions: [],
    });
  });

  it("strips glued acknowledgment text from the last action (no space after period)", () => {
    // Real observed output from Gemini 2.5-flash in the tutor session:
    // the model listed actions and then concatenated an acknowledgment
    // paragraph to the last one without a newline separator, producing
    // "I want to explore free will.Great choice! Ethics is a..."
    const result = parseActionsFromResponse(
      "Excellent! Let's narrow in.\n---ACTIONS---\n1. I'm interested in ethics.\n2. I'm curious about the nature of reality.\n3. I want to explore free will.Great choice! Ethics is a fascinating and fundamental area of philosophy.",
    );

    expect(result.suggestedActions).toEqual([
      "I'm interested in ethics.",
      "I'm curious about the nature of reality.",
      "I want to explore free will.",
    ]);
  });

  it("keeps question-mark-terminated actions intact", () => {
    const result = parseActionsFromResponse(
      "Good question.\n---ACTIONS---\n1. What is the thesis?\n2. What examples does the author give?",
    );

    expect(result.suggestedActions).toEqual([
      "What is the thesis?",
      "What examples does the author give?",
    ]);
  });
});
