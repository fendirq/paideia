import { describe, it, expect } from "vitest";
import {
  formatFingerprintNarrative,
  normalizeFingerprint,
  buildLevel2PlanPrompt,
  buildLevel2WritingPrompt,
  buildLevel2AuditPrompt,
} from "@/lib/essay-generator";
import type {
  SelfAssessment,
  StyleFingerprint,
  GenerateOptions,
  TeacherProfile,
} from "@/lib/essay-generator";

function makeFingerprint(overrides: Partial<StyleFingerprint> = {}): StyleFingerprint {
  return normalizeFingerprint({
    sentencePatterns: { averageLength: 18, variation: "medium", tendency: "Favors compound sentences joined by 'and'" },
    vocabulary: {
      tier: "moderate",
      signatureWords: ["shows", "proves", "important", "society", "also"],
      avoidedWords: ["juxtaposition", "paradigm", "exemplifies"],
      wordChoicePattern: "Uses simple verbs, rarely uses adverbs",
    },
    transitions: {
      favorites: ["However", "Also", "This shows that"],
      neverUses: ["Furthermore", "Moreover", "Subsequently"],
      paragraphOpeners: ["The", "This shows", "In the text"],
    },
    structure: {
      introPattern: "Broad context narrowing to thesis",
      bodyParagraphPattern: "Topic sentence + quote + analysis + wrap",
      conclusionPattern: "Restates thesis with slight expansion",
      avgParagraphLength: 4,
      thesisPlacement: "End of first paragraph",
    },
    evidenceStyle: {
      method: "quote-dump",
      citationHabits: "Parenthetical page numbers",
      analysisDepth: "moderate",
      analysisPattern: "States the quote then explains in 1 sentence",
    },
    errors: {
      grammarPatterns: ["comma splices before 'and'"],
      punctuationHabits: ["avoids semicolons"],
      spellingTendency: "Occasional misspellings of complex words",
    },
    voice: {
      formality: "mixed",
      perspective: "third-person",
      contractions: true,
      toneDescription: "Attempts academic tone but slips into conversational register",
      distinctiveTraits: ["ends analysis with 'which shows...'"],
    },
    rhetoric: {
      argumentStyle: "states-then-defends",
      counterArguments: "ignores",
      hedgingLanguage: ["I think", "it seems like"],
      assertiveness: "moderate",
    },
    rhythm: {
      sentenceOpeners: ["The", "This shows", "In the text", "However"],
      paragraphRhythm: "uniform",
      listUsage: "never",
    },
    overallAssessment: "A competent but developing writer.",
    ...overrides,
  } as Record<string, unknown>);
}

function makeSelfAssessment(overrides: Partial<SelfAssessment> = {}): SelfAssessment {
  return {
    gradeRange: "B-/C+",
    gradeRangeOther: "",
    revisionLevel: "I reread and fix obvious errors",
    revisionOther: "",
    evidenceApproach: "I find a quote and explain it",
    evidenceOther: "",
    conclusionApproach: "I restate my thesis in different words",
    conclusionOther: "",
    wordCountTendency: "I usually write slightly under the target",
    wordCountOther: "",
    writingHabits: ["I overuse certain transition words"],
    writingHabitsOther: "",
    quoteIntroStyle: ["As [author] states..."],
    quoteIntroOther: "",
    overusedPhrases: ["however", "this shows that"],
    overusedPhrasesOther: "",
    selfEditFocus: ["spelling mistakes"],
    selfEditOther: "",
    timeSpentOn: "body paragraphs",
    timeSpentOther: "",
    ...overrides,
  };
}

describe("formatFingerprintNarrative", () => {
  it("produces readable text, not JSON", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = formatFingerprintNarrative(fp);

    expect(result).not.toContain("{");
    expect(result).not.toContain("}");
    expect(result).not.toContain('"sentencePatterns"');

    expect(result).toContain("18");
    expect(result).toContain("moderate");
    expect(result).toContain("compound sentences");
  });

  it("includes vocabulary signature words and avoided words", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = formatFingerprintNarrative(fp);

    expect(result).toContain("shows");
    expect(result).toContain("proves");
    expect(result).toContain("juxtaposition");
  });

  it("includes transition favorites and avoids", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = formatFingerprintNarrative(fp);

    expect(result).toContain("However");
    expect(result).toContain("Furthermore");
  });

  it("includes error patterns", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = formatFingerprintNarrative(fp);

    expect(result).toContain("comma splices");
    expect(result).toContain("semicolons");
  });

  it("includes overall assessment", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = formatFingerprintNarrative(fp);

    expect(result).toContain("competent but developing");
  });

  it("handles empty arrays gracefully", () => {
    const fp = makeFingerprint({
      vocabulary: {
        tier: "basic",
        signatureWords: [],
        avoidedWords: [],
        wordChoicePattern: "Simple words",
      },
      transitions: { favorites: [], neverUses: [], paragraphOpeners: [] },
      errors: { grammarPatterns: [], punctuationHabits: [], spellingTendency: "" },
      rhetoric: {
        argumentStyle: "builds-gradually",
        counterArguments: "ignores",
        hedgingLanguage: [],
        assertiveness: "tentative",
      },
      rhythm: { sentenceOpeners: [], paragraphRhythm: "varied", listUsage: "never" },
    });
    const sa = makeSelfAssessment();
    const result = formatFingerprintNarrative(fp);

    expect(result).toBeTruthy();
    expect(result).toContain("basic");
  });
});

// ─── Helpers for prompt builder tests ───

function makeTeacherProfile(): TeacherProfile {
  return {
    gradeLevel: "11th grade",
    gradeOther: "",
    losesPointsFor: ["weak thesis", "lack of evidence"],
    losesPointsOther: "",
  };
}

function makeOpts(overrides: Partial<GenerateOptions> = {}): GenerateOptions {
  return {
    teacherProfile: makeTeacherProfile(),
    selfAssessment: makeSelfAssessment(),
    fingerprint: makeFingerprint(),
    samples: [
      { label: "Essay 1", content: "This is a sample essay about history. The events of the war showed that..." },
      { label: "Essay 2", content: "In the novel, the author shows how the character changes. This proves that..." },
    ],
    assignment: "Write a 500-word essay about symbolism in The Great Gatsby.",
    wordCount: 500,
    requirements: "Include at least 3 quotes.",
    ...overrides,
  };
}

// ─── Plan prompt tests ───

describe("buildLevel2PlanPrompt", () => {
  it("includes assignment and requirements", () => {
    const result = buildLevel2PlanPrompt(makeOpts());
    expect(result).toContain("symbolism in The Great Gatsby");
    expect(result).toContain("3 quotes");
  });

  it("includes student context (grade level, grade range)", () => {
    const result = buildLevel2PlanPrompt(makeOpts());
    expect(result).toContain("11th grade");
    expect(result).toContain("B-/C+");
  });

  it("does NOT include fingerprint JSON", () => {
    const result = buildLevel2PlanPrompt(makeOpts());
    expect(result).not.toContain('"sentencePatterns"');
    expect(result).not.toContain("VOICE ENFORCEMENT");
    expect(result).not.toContain("Voice Placement Plan");
  });

  it("does NOT include writing samples", () => {
    const result = buildLevel2PlanPrompt(makeOpts());
    expect(result).not.toContain("events of the war");
    expect(result).not.toContain("Reference 1");
  });

  it("includes word count target", () => {
    const result = buildLevel2PlanPrompt(makeOpts());
    expect(result).toContain("500");
  });
});

// ─── Writing prompt tests ───

describe("buildLevel2WritingPrompt", () => {
  const outline = "I. Intro with thesis\nII. Green light analysis\nIII. Valley of Ashes\nIV. Conclusion";

  it("places samples BEFORE fingerprint", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    const samplesIdx = result.indexOf("THEIR ACTUAL WRITING");
    const profileIdx = result.indexOf("WRITER'S PROFILE");
    expect(samplesIdx).toBeGreaterThan(-1);
    expect(profileIdx).toBeGreaterThan(-1);
    expect(samplesIdx).toBeLessThan(profileIdx);
  });

  it("includes samples content", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    expect(result).toContain("events of the war");
    expect(result).toContain("author shows how the character");
  });

  it("uses narrative fingerprint, not JSON", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    expect(result).not.toContain('"sentencePatterns"');
    expect(result).not.toContain('"vocabulary"');
    expect(result).toContain("Sentences:");
    expect(result).toContain("Vocabulary:");
  });

  it("presents questionnaire data as context, not rules", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    expect(result).not.toContain("VOICE ENFORCEMENT");
    expect(result).not.toContain("Each rule is mandatory");
    expect(result).toContain("WHAT THE STUDENT SAYS");
  });

  it("includes anti-checklist directive", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    expect(result).toContain("Do NOT apply every stylistic trait in every paragraph");
  });

  it("includes AI red flag avoidance", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    expect(result).toContain("delve into");
    expect(result).toContain("multifaceted");
  });

  it("includes the outline", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    expect(result).toContain("Green light analysis");
  });

  it("includes Level 2 enhanced fields as context", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    expect(result).toContain("As [author] states");
    expect(result).toContain("however");
    expect(result).toContain("body paragraphs");
  });
});

// ─── Audit prompt tests ───

describe("buildLevel2AuditPrompt", () => {
  const essay = "Gatsby believed in the green light. This shows that the American Dream is impossible.";

  it("places samples before essay in correct sections", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const samples = [
      { label: "Essay 1", content: "Sample content here about the war" },
      { label: "Essay 2", content: "Another sample about literature" },
    ];
    const result = buildLevel2AuditPrompt(essay, fp, samples, sa);

    // Samples appear in the reference section
    expect(result).toContain("Sample content here about the war");
    expect(result).toContain("Another sample about literature");
    expect(result).toContain("STUDENT'S REAL WRITING");

    // Essay appears in the audit section
    expect(result).toContain("green light");
    expect(result).toContain("GENERATED ESSAY TO AUDIT");

    // Samples come BEFORE the essay (forensic comparison order)
    const samplesIdx = result.indexOf("STUDENT'S REAL WRITING");
    const essayIdx = result.indexOf("GENERATED ESSAY TO AUDIT");
    expect(samplesIdx).toBeLessThan(essayIdx);
  });

  it("uses forensic comparison framing, not checklist", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2AuditPrompt(essay, fp, samples, sa);
    expect(result).not.toContain("Checklist");
    expect(result).not.toContain("verify each one");
    expect(result).toContain("would a teacher");
  });

  it("explicitly says do NOT remove imperfections", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2AuditPrompt(essay, fp, samples, sa);
    expect(result).toContain("Do NOT remove intentional imperfections");
  });

  it("includes AI detector phrases", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2AuditPrompt(essay, fp, samples, sa);
    expect(result).toContain("delve into");
    expect(result).toContain("pivotal");
  });
});
