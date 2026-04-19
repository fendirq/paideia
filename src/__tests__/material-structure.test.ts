// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  validateStructure,
  resolveDetectionModel,
  type MaterialStructure,
} from "../lib/material-structure";

describe("validateStructure — happy paths", () => {
  it("accepts reading_only", () => {
    const out = validateStructure({
      kind: "reading_only",
      passage: "A passage about photosynthesis.",
    });
    expect(out).toEqual({
      kind: "reading_only",
      passage: "A passage about photosynthesis.",
    });
  });

  it("accepts reading_with_questions", () => {
    const out = validateStructure({
      kind: "reading_with_questions",
      passage: "Short passage.",
      questions: [
        { id: "q1", number: "1", text: "What is X?", type: "short_answer" },
        {
          id: "q2",
          text: "Pick one",
          type: "multiple_choice",
          choices: ["a", "b"],
        },
      ],
    });
    expect(out?.kind).toBe("reading_with_questions");
    if (out?.kind === "reading_with_questions") {
      expect(out.questions).toHaveLength(2);
    }
  });

  it("accepts worksheet with sections", () => {
    const out = validateStructure({
      kind: "worksheet",
      sections: [
        {
          title: "Part A",
          questions: [{ id: "q1", text: "Q1", type: "short_answer" }],
        },
        {
          questions: [{ id: "q2", text: "Q2", type: "long_answer" }],
        },
      ],
    });
    expect(out?.kind).toBe("worksheet");
    if (out?.kind === "worksheet") {
      expect(out.sections).toHaveLength(2);
      expect(out.sections[1].title).toBeUndefined();
    }
  });

  it("accepts problem_set", () => {
    const out = validateStructure({
      kind: "problem_set",
      problems: [
        { id: "p1", number: "1", text: "Integrate x dx.", pointValue: 10 },
      ],
    });
    expect(out?.kind).toBe("problem_set");
  });

  it("accepts essay_prompt with optional rubric + requirements", () => {
    const out = validateStructure({
      kind: "essay_prompt",
      prompt: "Write an analytical essay.",
      requirements: ["1200 words", "MLA"],
      rubric: "Thesis: 25pts; Evidence: 25pts.",
    });
    expect(out?.kind).toBe("essay_prompt");
  });

  it("accepts essay_prompt without optional fields", () => {
    const out = validateStructure({
      kind: "essay_prompt",
      prompt: "Write something.",
    });
    expect(out?.kind).toBe("essay_prompt");
    if (out?.kind === "essay_prompt") {
      expect(out.requirements).toBeUndefined();
      expect(out.rubric).toBeUndefined();
    }
  });

  it("accepts fill_in_template", () => {
    const out = validateStructure({
      kind: "fill_in_template",
      template: "Name: ____",
      blanks: [
        { id: "b1", contextBefore: "Name: ", contextAfter: "Period:" },
      ],
    });
    expect(out?.kind).toBe("fill_in_template");
  });

  it("accepts unknown", () => {
    const out = validateStructure({ kind: "unknown" });
    expect(out).toEqual({ kind: "unknown" });
  });
});

describe("validateStructure — rejections", () => {
  it("rejects null/undefined/primitive input", () => {
    expect(validateStructure(null)).toBeNull();
    expect(validateStructure(undefined)).toBeNull();
    expect(validateStructure("string")).toBeNull();
    expect(validateStructure(42)).toBeNull();
  });

  it("rejects missing kind", () => {
    expect(validateStructure({ passage: "x" })).toBeNull();
  });

  it("rejects unknown kind value", () => {
    expect(validateStructure({ kind: "something_else" })).toBeNull();
  });

  it("rejects reading_only with non-string passage", () => {
    expect(validateStructure({ kind: "reading_only", passage: 123 })).toBeNull();
  });

  it("rejects question with invalid type", () => {
    const out = validateStructure({
      kind: "reading_with_questions",
      passage: "x",
      questions: [{ id: "q1", text: "t", type: "essay" }],
    });
    expect(out).toBeNull();
  });

  it("rejects question missing required fields", () => {
    const out = validateStructure({
      kind: "reading_with_questions",
      passage: "x",
      questions: [{ id: "q1", text: "t" }],
    });
    expect(out).toBeNull();
  });

  it("rejects worksheet with empty sections array (per P1 review)", () => {
    const out = validateStructure({ kind: "worksheet", sections: [] });
    expect(out).toBeNull();
  });

  it("rejects worksheet section with empty questions array", () => {
    const out = validateStructure({
      kind: "worksheet",
      sections: [{ title: "Part A", questions: [] }],
    });
    expect(out).toBeNull();
  });

  it("rejects problem_set with empty problems array (per P1 review)", () => {
    const out = validateStructure({ kind: "problem_set", problems: [] });
    expect(out).toBeNull();
  });

  it("rejects fill_in_template with non-array blanks", () => {
    const out = validateStructure({
      kind: "fill_in_template",
      template: "t",
      blanks: "not-an-array",
    });
    expect(out).toBeNull();
  });

  it("rejects blank missing contextAfter", () => {
    const out = validateStructure({
      kind: "fill_in_template",
      template: "t",
      blanks: [{ id: "b1", contextBefore: "before" }],
    });
    expect(out).toBeNull();
  });

  it("rejects problem with non-numeric pointValue", () => {
    const out = validateStructure({
      kind: "problem_set",
      problems: [{ id: "p1", text: "x", pointValue: "ten" }],
    });
    expect(out).toBeNull();
  });
});

describe("validateStructure — type narrowing", () => {
  it("preserves discriminated union so callers can switch on kind", () => {
    const raw: unknown = {
      kind: "problem_set",
      problems: [{ id: "p1", text: "integrate" }],
    };
    const out = validateStructure(raw);
    if (out && out.kind === "problem_set") {
      // Type narrowing: out.problems is now Problem[]
      const typed: MaterialStructure = out;
      expect(typed.kind).toBe("problem_set");
      if (typed.kind === "problem_set") {
        expect(typed.problems[0].id).toBe("p1");
      }
    } else {
      throw new Error("expected problem_set");
    }
  });
});

describe("resolveDetectionModel", () => {
  const ORIGINAL = process.env.MATERIAL_STRUCTURE_MODEL;

  it("defaults to gemini-3-flash-preview when no env override", () => {
    delete process.env.MATERIAL_STRUCTURE_MODEL;
    expect(resolveDetectionModel()).toBe("gemini-3-flash-preview");
    if (ORIGINAL !== undefined) process.env.MATERIAL_STRUCTURE_MODEL = ORIGINAL;
  });

  it("honors env override", () => {
    process.env.MATERIAL_STRUCTURE_MODEL = "gemini-2.5-flash";
    expect(resolveDetectionModel()).toBe("gemini-2.5-flash");
    if (ORIGINAL === undefined) delete process.env.MATERIAL_STRUCTURE_MODEL;
    else process.env.MATERIAL_STRUCTURE_MODEL = ORIGINAL;
  });

  it("trims whitespace around env override", () => {
    process.env.MATERIAL_STRUCTURE_MODEL = "  gemini-foo  ";
    expect(resolveDetectionModel()).toBe("gemini-foo");
    if (ORIGINAL === undefined) delete process.env.MATERIAL_STRUCTURE_MODEL;
    else process.env.MATERIAL_STRUCTURE_MODEL = ORIGINAL;
  });
});
