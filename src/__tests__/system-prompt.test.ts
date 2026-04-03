import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/system-prompt";

const baseContext = {
  unitName: "Test Unit",
  teacherName: "Mr. Test",
  description: "Test description",
  ragChunks: [] as { content: string }[],
  helpType: null,
};

describe("buildSystemPrompt", () => {
  it("includes LaTeX formatting rules for MATHEMATICS", () => {
    const prompt = buildSystemPrompt({ ...baseContext, subject: "MATHEMATICS" });
    expect(prompt).toContain("LaTeX");
    expect(prompt).toContain("$x^2$");
  });

  it("includes LaTeX formatting rules for SCIENCE", () => {
    const prompt = buildSystemPrompt({ ...baseContext, subject: "SCIENCE" });
    expect(prompt).toContain("LaTeX");
  });

  it("excludes LaTeX rules for ENGLISH", () => {
    const prompt = buildSystemPrompt({ ...baseContext, subject: "ENGLISH" });
    expect(prompt).not.toContain("$x^2$");
    expect(prompt).toContain("thesis");
  });

  it("excludes LaTeX rules for HISTORY", () => {
    const prompt = buildSystemPrompt({ ...baseContext, subject: "HISTORY" });
    expect(prompt).not.toContain("$x^2$");
    expect(prompt).toContain("primary source");
  });

  it("uses writing prompt for HUMANITIES", () => {
    const prompt = buildSystemPrompt({ ...baseContext, subject: "HUMANITIES" });
    expect(prompt).not.toContain("$x^2$");
    expect(prompt).toContain("thesis");
  });

  it("includes help type when provided", () => {
    const prompt = buildSystemPrompt({
      ...baseContext,
      subject: "ENGLISH",
      helpType: "essay-feedback",
    });
    expect(prompt).toContain("essay-feedback");
  });

  it("includes RAG context when chunks are provided", () => {
    const prompt = buildSystemPrompt({
      ...baseContext,
      subject: "ENGLISH",
      ragChunks: [{ content: "Sample excerpt" }],
    });
    expect(prompt).toContain("Sample excerpt");
  });

  it("falls back to writing prompt for OTHER", () => {
    const prompt = buildSystemPrompt({ ...baseContext, subject: "OTHER" });
    expect(prompt).toContain("Paideia");
    expect(prompt).toContain("ONE STEP AT A TIME");
  });

  it("includes cause-and-effect chain guidance for HISTORY", () => {
    const prompt = buildSystemPrompt({ ...baseContext, subject: "HISTORY" });
    expect(prompt).toContain("cause-and-effect");
    expect(prompt).toContain("→");
  });

  it("includes source analysis guidance for HISTORY with helpType", () => {
    const prompt = buildSystemPrompt({
      ...baseContext,
      subject: "HISTORY",
      helpType: "source-analysis",
    });
    expect(prompt).toContain("source-analysis");
  });

  it("includes writing structure guidance for ENGLISH", () => {
    const prompt = buildSystemPrompt({ ...baseContext, subject: "ENGLISH" });
    expect(prompt).toContain("thesis");
    expect(prompt).toContain("evidence");
  });

  it("includes arrow notation guidance for math", () => {
    const prompt = buildSystemPrompt({ ...baseContext, subject: "MATHEMATICS" });
    expect(prompt).toContain("arrow notation");
    expect(prompt).toContain("→");
  });

  it("all subjects share the golden rule", () => {
    for (const subject of ["MATHEMATICS", "ENGLISH", "HISTORY", "SCIENCE", "HUMANITIES"]) {
      const prompt = buildSystemPrompt({ ...baseContext, subject });
      expect(prompt).toContain("GOLDEN RULE: ONE STEP AT A TIME");
      expect(prompt).toContain("---ACTIONS---");
    }
  });
});
