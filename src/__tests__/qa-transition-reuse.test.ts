import { describe, expect, it } from "vitest";
import { computeMaxTransitionReuse } from "../../scripts/qa-lib/transition-reuse";

describe("computeMaxTransitionReuse", () => {
  it("returns 0 when no favorites are provided", () => {
    expect(computeMaxTransitionReuse("This is a sentence with The and But everywhere.", [])).toBe(0);
  });

  it("returns 0 when all favorites are common single words (excluded)", () => {
    const essay = "The cat. But the dog. What a day. If only. And then. So far.";
    expect(computeMaxTransitionReuse(essay, ["The", "But", "What", "If", "And", "So"])).toBe(0);
  });

  it("counts multi-word transitions with word boundaries", () => {
    const essay = "At the same time, the Abbasids rose. At the same time, the Umayyads fell.";
    expect(computeMaxTransitionReuse(essay, ["At the same time"])).toBe(2);
  });

  it("returns the MAX across multiple distinctive favorites", () => {
    const essay = "That matters because of X. That matters because of Y. However, Z happened. However, W also happened. However, V too.";
    expect(
      computeMaxTransitionReuse(essay, ["That matters because", "However"]),
    ).toBe(3);
  });

  it("counts length-7+ single words as distinctive", () => {
    const essay = "However this works. However that fails. However.";
    expect(computeMaxTransitionReuse(essay, ["However"])).toBe(3);
  });

  it("filters out length-<7 single-word favorites even if repeated", () => {
    const essay = "Even a lot of Even Even Even. Even.";
    // "Even" is 4 chars, filtered out
    expect(computeMaxTransitionReuse(essay, ["Even"])).toBe(0);
  });

  it("uses word boundaries — 'But' does not match 'butter'", () => {
    const essay = "Butterfly. Buttress. Button.";
    // Even if 'But' weren't filtered, word boundary would prevent sub-word matches
    expect(computeMaxTransitionReuse(essay, ["However"])).toBe(0);
  });

  it("is case-insensitive", () => {
    const essay = "At the same time. AT THE SAME TIME. at the same time.";
    expect(computeMaxTransitionReuse(essay, ["At the same time"])).toBe(3);
  });

  it("escapes regex special characters in favorites", () => {
    const essay = "The answer is (obviously) true. The answer is (obviously) clear.";
    expect(computeMaxTransitionReuse(essay, ["(obviously)"])).toBe(0); // single-word, length 11 — distinctive
  });

  it("mixes distinctive and common favorites — only distinctive count", () => {
    const essay = "The cat. The dog. The mouse. At the same time, the sky was blue.";
    // 'The' (common, excluded) appears 4x; 'At the same time' (distinctive) appears 1x
    expect(computeMaxTransitionReuse(essay, ["The", "At the same time"])).toBe(1);
  });
});
