import { describe, it, expect } from "vitest";
import {
  buildSystemPrompt,
  buildStructureInstructions,
} from "@/lib/system-prompt";
import type { MaterialStructure } from "@/lib/material-structure";

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

describe("buildStructureInstructions", () => {
  it("returns empty string for null / undefined / unknown", () => {
    expect(buildStructureInstructions(null)).toBe("");
    expect(buildStructureInstructions(undefined)).toBe("");
    expect(buildStructureInstructions({ kind: "unknown" })).toBe("");
  });

  it("emits a reading_only block that steers toward engagement", () => {
    const out = buildStructureInstructions({
      kind: "reading_only",
      passage: "Some passage.",
    });
    expect(out).toContain("Material Structure");
    expect(out).toContain("reading passage");
    expect(out).toContain("quote");
  });

  it("emits a reading_with_questions block with count + Socratic-first guidance", () => {
    const structure: MaterialStructure = {
      kind: "reading_with_questions",
      passage: "P",
      questions: [
        { id: "q1", number: "1", text: "First question", type: "short_answer" },
        { id: "q2", number: "2", text: "Second question", type: "long_answer" },
      ],
    };
    const out = buildStructureInstructions(structure);
    expect(out).toContain("2 questions");
    expect(out).toContain("First question");
    expect(out).toContain("Socratic");
    expect(out).toContain("walk me through");
  });

  it("emits a worksheet block naming each section + question count", () => {
    const out = buildStructureInstructions({
      kind: "worksheet",
      sections: [
        {
          title: "Part A: Vocabulary",
          questions: [
            { id: "q1", text: "Define X", type: "short_answer" },
            { id: "q2", text: "Define Y", type: "short_answer" },
          ],
        },
        {
          questions: [
            { id: "q3", text: "Essay question", type: "long_answer" },
          ],
        },
      ],
    });
    expect(out).toContain("Part A: Vocabulary");
    expect(out).toContain("2 questions");
    expect(out).toContain("Section 2");
    expect(out).toContain("Socratic");
  });

  it("emits a problem_set block with preview of first 3 problems", () => {
    const out = buildStructureInstructions({
      kind: "problem_set",
      problems: [
        { id: "p1", number: "1", text: "Integrate x^2" },
        { id: "p2", number: "2", text: "Differentiate sin(x)" },
        { id: "p3", number: "3", text: "Find dy/dx for y = ..." },
        { id: "p4", number: "4", text: "Not previewed" },
      ],
    });
    expect(out).toContain("4 problems");
    expect(out).toContain("Integrate x^2");
    expect(out).toContain("Differentiate");
    expect(out).not.toContain("Not previewed");
    expect(out).toContain("every step");
  });

  it("emits an essay_prompt block with requirements + clipped rubric", () => {
    const out = buildStructureInstructions({
      kind: "essay_prompt",
      prompt: "Write an analytical essay.",
      requirements: ["1200 words", "MLA format", "5 citations"],
      rubric: "Thesis 25pts; Evidence 25pts; Organization 15pts.",
    });
    expect(out).toContain("analytical essay");
    expect(out).toContain("1200 words");
    expect(out).toContain("MLA format");
    expect(out).toContain("Thesis 25pts");
    expect(out).toContain("do not ghostwrite");
  });

  it("emits a fill_in_template block guarding against just-fill-it-for-me requests", () => {
    const out = buildStructureInstructions({
      kind: "fill_in_template",
      template: "Name: ___",
      blanks: [
        { id: "b1", contextBefore: "Name: ", contextAfter: "Date:" },
        { id: "b2", contextBefore: "Topic: ", contextAfter: "Argument:" },
      ],
    });
    expect(out).toContain("2 blanks");
    expect(out).toContain("fill each blank themselves");
    expect(out).toContain("all the answers");
  });

  it("buildSystemPrompt injects the structure block before ---ACTIONS---", () => {
    const prompt = buildSystemPrompt({
      ...baseContext,
      subject: "MATHEMATICS",
      structure: {
        kind: "problem_set",
        problems: [{ id: "p1", text: "Integrate" }],
      },
    });
    const structureIdx = prompt.indexOf("## Material Structure");
    const actionsIdx = prompt.indexOf("---ACTIONS---");
    expect(structureIdx).toBeGreaterThan(0);
    expect(actionsIdx).toBeGreaterThan(structureIdx);
  });

  it("buildSystemPrompt omits the structure block when structure is null/undefined", () => {
    const prompt = buildSystemPrompt({ ...baseContext, subject: "ENGLISH" });
    expect(prompt).not.toContain("## Material Structure");
  });

  it("buildSystemPrompt omits the structure block when kind is unknown", () => {
    const prompt = buildSystemPrompt({
      ...baseContext,
      subject: "ENGLISH",
      structure: { kind: "unknown" },
    });
    expect(prompt).not.toContain("## Material Structure");
  });
});
