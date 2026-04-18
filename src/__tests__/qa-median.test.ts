import { describe, expect, it } from "vitest";
import { median, min, max, summarize } from "../../scripts/qa-lib/median";

describe("median", () => {
  it("returns the middle value for odd-length arrays", () => {
    expect(median([1, 3, 5])).toBe(3);
    expect(median([5, 1, 3])).toBe(3);
  });

  it("averages the two middle values for even-length arrays", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it("returns NaN for empty arrays", () => {
    expect(median([])).toBeNaN();
  });

  it("ignores undefined/null entries", () => {
    expect(median([1, undefined, 3, null, 5])).toBe(3);
  });

  it("handles a single-element array", () => {
    expect(median([7])).toBe(7);
  });

  it("handles decimal inputs", () => {
    expect(median([1.5, 2.5, 3.5])).toBe(2.5);
  });
});

describe("min / max", () => {
  it("min returns the smallest value", () => {
    expect(min([5, 3, 1, 4])).toBe(1);
  });

  it("max returns the largest value", () => {
    expect(max([5, 3, 1, 4])).toBe(5);
  });

  it("ignores non-numeric entries", () => {
    expect(min([5, undefined, 1])).toBe(1);
    expect(max([undefined, 3, null])).toBe(3);
  });

  it("returns NaN for empty arrays", () => {
    expect(min([])).toBeNaN();
    expect(max([])).toBeNaN();
  });
});

describe("summarize", () => {
  it("returns {min, median, max, count}", () => {
    expect(summarize([1, 2, 3, 4, 5])).toEqual({ min: 1, median: 3, max: 5, count: 5 });
  });

  it("handles even-count arrays", () => {
    expect(summarize([1, 2, 3, 4])).toEqual({ min: 1, median: 2.5, max: 4, count: 4 });
  });

  it("returns all NaN with count 0 for empty", () => {
    const s = summarize([]);
    expect(s.count).toBe(0);
    expect(Number.isNaN(s.min)).toBe(true);
    expect(Number.isNaN(s.median)).toBe(true);
    expect(Number.isNaN(s.max)).toBe(true);
  });

  it("ignores non-numeric entries", () => {
    expect(summarize([null, 2, undefined, 4, 6])).toEqual({ min: 2, median: 4, max: 6, count: 3 });
  });
});
