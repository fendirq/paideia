import { describe, it, expect } from "vitest";
import { filterResponseBySubject } from "@/lib/content-filter";

describe("filterResponseBySubject", () => {
  it("preserves LaTeX for MATHEMATICS", () => {
    const input = "The answer is $x^2 + 1$ and $$\\int_0^1 x\\,dx$$";
    const result = filterResponseBySubject(input, "MATHEMATICS");
    expect(result).toContain("$x^2 + 1$");
    expect(result).toContain("$$\\int_0^1 x\\,dx$$");
  });

  it("preserves LaTeX for SCIENCE", () => {
    const input = "The formula is $E = mc^2$";
    const result = filterResponseBySubject(input, "SCIENCE");
    expect(result).toContain("$E = mc^2$");
  });

  it("strips inline LaTeX for ENGLISH", () => {
    const input = "The thesis is $not math$ and the argument";
    const result = filterResponseBySubject(input, "ENGLISH");
    expect(result).not.toContain("$not math$");
    expect(result).toContain("not math");
  });

  it("strips display LaTeX for ENGLISH", () => {
    const input = "Consider this: $$some display math$$ and more text";
    const result = filterResponseBySubject(input, "ENGLISH");
    expect(result).not.toContain("$$");
    expect(result).toContain("some display math");
  });

  it("strips LaTeX for HISTORY", () => {
    const input = "In $1945$ the war ended";
    const result = filterResponseBySubject(input, "HISTORY");
    expect(result).not.toContain("$1945$");
    expect(result).toContain("1945");
  });

  it("strips LaTeX for HUMANITIES", () => {
    const input = "The concept of $beauty$";
    const result = filterResponseBySubject(input, "HUMANITIES");
    expect(result).toContain("beauty");
    expect(result).not.toMatch(/\$beauty\$/);
  });

  it("cleans up LaTeX commands in non-STEM subjects", () => {
    const input = "Use \\textbf{bold} and \\frac{1}{2}";
    const result = filterResponseBySubject(input, "ENGLISH");
    expect(result).not.toContain("\\textbf");
    expect(result).not.toContain("\\frac");
  });

  it("preserves markdown formatting", () => {
    const input = "This is **bold** and *italic* text";
    const result = filterResponseBySubject(input, "ENGLISH");
    expect(result).toContain("**bold**");
    expect(result).toContain("*italic*");
  });

  it("returns unchanged text for unknown subjects", () => {
    const input = "Hello $world$";
    const result = filterResponseBySubject(input, "OTHER");
    expect(result).toBe(input);
  });
});
