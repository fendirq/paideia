import { describe, expect, it } from "vitest";
import {
  buildPersistedRequirements,
  formatSourceContextForPrompt,
  inferRequiredEvidenceCount,
  inferTargetWordCount,
  normalizeSourceLinks,
} from "@/lib/source-context";

describe("source-context helpers", () => {
  it("normalizes and deduplicates links", () => {
    const links = normalizeSourceLinks([
      "https://example.com/article",
      "https://example.com/article",
      "notaurl",
      "http://example.org/source",
    ]);

    expect(links).toEqual([
      "https://example.com/article",
      "http://example.org/source",
    ]);
  });

  it("infers target word count from a range", () => {
    expect(inferTargetWordCount("Write a 700 to 850 word essay about the Abbasids.")).toBe(775);
  });

  it("infers target word count from a single value", () => {
    expect(inferTargetWordCount("Write a 600-word response.")).toBe(600);
  });

  it("infers required evidence count from rubric language", () => {
    expect(inferRequiredEvidenceCount("Use at least three specific pieces of evidence.")).toBe(3);
    expect(inferRequiredEvidenceCount("Use at least 4 evidence points in your response.")).toBe(4);
    expect(inferRequiredEvidenceCount("Use five specific historical examples in your essay.")).toBe(5);
    expect(inferRequiredEvidenceCount("Incorporate 6 pieces of concrete evidence from the packet.")).toBe(6);
    expect(inferRequiredEvidenceCount("Include seven concrete details drawn from the primary sources.")).toBe(7);
  });

  it("builds persisted requirements with source sections", () => {
    const result = buildPersistedRequirements(
      "Use three pieces of evidence.",
      ["https://example.com/source-1"],
      "Primary source excerpt here.",
    );

    expect(result).toContain("Use three pieces of evidence.");
    expect(result).toContain("Source Links:");
    expect(result).toContain("Source Notes:");
  });

  it("formats source context for prompts", () => {
    const result = formatSourceContextForPrompt(
      [{ url: "https://example.com", title: "Example", excerpt: "Important source text." }],
      "Teacher note.",
    );

    expect(result).toContain("APPROVED SOURCE MATERIAL");
    expect(result).toContain("Important source text.");
    expect(result).toContain("USER-PROVIDED SOURCE NOTES");
  });
});
