// @vitest-environment node
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

// Hoisted mocks — the SDK + db are both needed so the real
// detectStructure + persist helpers can run without a network
// call or a real database.
const {
  fileUpdateMock,
  materialFileUpdateMock,
  generateContentMock,
} = vi.hoisted(() => ({
  fileUpdateMock: vi.fn(),
  materialFileUpdateMock: vi.fn(),
  generateContentMock: vi.fn(),
}));

vi.mock("../lib/db", () => ({
  db: {
    file: { update: fileUpdateMock },
    classMaterialFile: { update: materialFileUpdateMock },
  },
}));

vi.mock("@google/genai", () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = { generateContent: generateContentMock };
  },
}));

import {
  detectAndPersistStructureForFile,
  detectAndPersistStructureForMaterialFile,
  isMaterialStructureEnabled,
  resolveDetectionModel,
  validateStructure,
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

describe("isMaterialStructureEnabled", () => {
  const ORIGINAL = process.env.ENABLE_MATERIAL_STRUCTURE;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.ENABLE_MATERIAL_STRUCTURE;
    else process.env.ENABLE_MATERIAL_STRUCTURE = ORIGINAL;
  });

  it("false when unset (default)", () => {
    delete process.env.ENABLE_MATERIAL_STRUCTURE;
    expect(isMaterialStructureEnabled()).toBe(false);
  });

  it("true only for exact 'true' (case-insensitive, trimmed)", () => {
    process.env.ENABLE_MATERIAL_STRUCTURE = "true";
    expect(isMaterialStructureEnabled()).toBe(true);
    process.env.ENABLE_MATERIAL_STRUCTURE = "  TRUE  ";
    expect(isMaterialStructureEnabled()).toBe(true);
  });

  it("false for truthy-but-not-'true' values", () => {
    for (const v of ["1", "yes", "on", "false", "", "0"]) {
      process.env.ENABLE_MATERIAL_STRUCTURE = v;
      expect(isMaterialStructureEnabled()).toBe(false);
    }
  });
});

// Helper to stub a successful Gemini classification response.
// The real detectStructure parses response.text as JSON, validates
// via validateStructure, and writes the validated shape to the DB.
function mockGeminiSuccess(structure: MaterialStructure) {
  generateContentMock.mockResolvedValue({
    text: JSON.stringify(structure),
    candidates: [{ finishReason: "STOP" }],
  });
}

const ORIGINAL_FLAG = process.env.ENABLE_MATERIAL_STRUCTURE;
const ORIGINAL_KEY = process.env.GEMINI_API_KEY;

function resetFlagAndKey(): void {
  if (ORIGINAL_FLAG === undefined) delete process.env.ENABLE_MATERIAL_STRUCTURE;
  else process.env.ENABLE_MATERIAL_STRUCTURE = ORIGINAL_FLAG;
  if (ORIGINAL_KEY === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = ORIGINAL_KEY;
}

describe("detectAndPersistStructureForFile", () => {
  beforeEach(() => {
    fileUpdateMock.mockReset();
    materialFileUpdateMock.mockReset();
    generateContentMock.mockReset();
    process.env.GEMINI_API_KEY = "test-key";
  });
  afterEach(resetFlagAndKey);

  it("is a no-op when flag off (default)", async () => {
    delete process.env.ENABLE_MATERIAL_STRUCTURE;
    await detectAndPersistStructureForFile("file-1", "some text");
    expect(generateContentMock).not.toHaveBeenCalled();
    expect(fileUpdateMock).not.toHaveBeenCalled();
  });

  it("runs detection + persists on success when flag on", async () => {
    process.env.ENABLE_MATERIAL_STRUCTURE = "true";
    mockGeminiSuccess({
      kind: "problem_set",
      problems: [{ id: "p1", text: "integrate x dx" }],
    });
    fileUpdateMock.mockResolvedValue({});
    await detectAndPersistStructureForFile("file-1", "some text");
    expect(generateContentMock).toHaveBeenCalledTimes(1);
    expect(fileUpdateMock).toHaveBeenCalledTimes(1);
    const arg = fileUpdateMock.mock.calls[0][0];
    expect(arg.where).toEqual({ id: "file-1" });
    expect(arg.data.structureKind).toBe("problem_set");
    expect(arg.data.structureModel).toBe("gemini-3-flash-preview");
    expect(arg.data.structure).toEqual({
      kind: "problem_set",
      problems: [{ id: "p1", text: "integrate x dx" }],
    });
    expect(arg.data.structureExtractedAt).toBeInstanceOf(Date);
  });

  it("never throws when the Gemini call rejects — persists unknown + logs", async () => {
    process.env.ENABLE_MATERIAL_STRUCTURE = "true";
    generateContentMock.mockRejectedValueOnce(new Error("gemini exploded"));
    fileUpdateMock.mockResolvedValue({});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(
      detectAndPersistStructureForFile("file-2", "text"),
    ).resolves.toBeUndefined();
    // Still persists the `unknown` fallback so the column isn't null
    // in a way that's indistinguishable from "never ran".
    expect(fileUpdateMock).toHaveBeenCalledTimes(1);
    expect(fileUpdateMock.mock.calls[0][0].data.structureKind).toBe("unknown");
    warn.mockRestore();
  });

  it("never throws when the DB update throws — logs + swallows", async () => {
    process.env.ENABLE_MATERIAL_STRUCTURE = "true";
    mockGeminiSuccess({ kind: "reading_only", passage: "p" });
    fileUpdateMock.mockRejectedValueOnce(new Error("db down"));
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      detectAndPersistStructureForFile("file-3", "text"),
    ).resolves.toBeUndefined();
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it("persists the unknown result when the validator rejects", async () => {
    process.env.ENABLE_MATERIAL_STRUCTURE = "true";
    // Valid JSON but not a recognized shape → real detectStructure
    // falls back to { kind: "unknown" } internally, and the persist
    // helper writes that.
    generateContentMock.mockResolvedValue({
      text: JSON.stringify({ kind: "martian", foo: "bar" }),
      candidates: [{ finishReason: "STOP" }],
    });
    fileUpdateMock.mockResolvedValue({});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await detectAndPersistStructureForFile("file-4", "text");
    expect(fileUpdateMock).toHaveBeenCalledTimes(1);
    expect(fileUpdateMock.mock.calls[0][0].data.structureKind).toBe("unknown");
    warn.mockRestore();
  });
});

describe("detectAndPersistStructureForMaterialFile", () => {
  beforeEach(() => {
    fileUpdateMock.mockReset();
    materialFileUpdateMock.mockReset();
    generateContentMock.mockReset();
    process.env.GEMINI_API_KEY = "test-key";
  });
  afterEach(resetFlagAndKey);

  it("is a no-op when flag off", async () => {
    delete process.env.ENABLE_MATERIAL_STRUCTURE;
    await detectAndPersistStructureForMaterialFile("mat-1", "text");
    expect(generateContentMock).not.toHaveBeenCalled();
    expect(materialFileUpdateMock).not.toHaveBeenCalled();
  });

  it("hits the classMaterialFile table (not the file table) on success", async () => {
    process.env.ENABLE_MATERIAL_STRUCTURE = "true";
    mockGeminiSuccess({
      kind: "worksheet",
      sections: [
        { questions: [{ id: "q1", text: "x", type: "short_answer" }] },
      ],
    });
    materialFileUpdateMock.mockResolvedValue({});
    await detectAndPersistStructureForMaterialFile("mat-1", "text");
    expect(materialFileUpdateMock).toHaveBeenCalledTimes(1);
    expect(materialFileUpdateMock.mock.calls[0][0].where).toEqual({
      id: "mat-1",
    });
    // Sanity: we didn't accidentally ALSO write to File.
    expect(fileUpdateMock).not.toHaveBeenCalled();
  });
});
