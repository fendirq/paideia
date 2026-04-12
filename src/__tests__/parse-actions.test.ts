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
});
