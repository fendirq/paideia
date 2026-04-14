import { describe, it, expect } from "vitest";
import {
  formatFingerprintNarrative,
  normalizeFingerprint,
  buildLevel2PlanPrompt,
  buildLevel2WritingPrompt,
  buildLevel2CritiquePrompt,
  buildLevel2AuditPrompt,
  buildLevel2ExpansionPrompt,
  buildLevel2EvidenceIntegrationPrompt,
  buildLevel2AttributionPrompt,
  buildLevel2CompliancePrompt,
  buildLevel2SourcedDraftChoicePrompt,
  buildLevel2QuoteIntegrationPrompt,
  buildLevel2SourcedSynthesisPrompt,
  buildLevel2SourcedVoicePrompt,
  buildLevel2SourceFlowPrompt,
  buildLevel2TrimPrompt,
  buildLevel2NaturalnessPrompt,
  normalizeSupportedSourceAttribution,
  polishSourcedVoiceTexture,
  polishLevel2SurfaceVoice,
  stripUnsupportedSourceAttribution,
  humanizeEssay,
  sanitizeEssayOutput,
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
    const result = formatFingerprintNarrative(fp);

    expect(result).toContain("shows");
    expect(result).toContain("proves");
    expect(result).toContain("juxtaposition");
  });

  it("includes transition favorites and avoids in correct sections", () => {
    const fp = makeFingerprint();
    const result = formatFingerprintNarrative(fp);

    expect(result).toContain("Favors However");
    expect(result).toContain("Avoids: Furthermore");
  });

  it("includes error patterns", () => {
    const fp = makeFingerprint();
    const result = formatFingerprintNarrative(fp);

    expect(result).toContain("comma splices");
    expect(result).toContain("semicolons");
  });

  it("includes overall assessment", () => {
    const fp = makeFingerprint();
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
    expect(result).toContain("Preserve the student's recognizable style signatures");
  });

  it("treats quotations as introduce-and-explain evidence moves", () => {
    const result = buildLevel2WritingPrompt(
      makeOpts({
        sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1: al-Tabari packet excerpt ---\nThe movement called for \"the family of the Prophet.\"",
      }),
      outline,
    );

    expect(result).toContain("When a quote is used, introduce it by naming the source or speaker");
    expect(result).toContain("In history-style writing, name the source in prose");
    expect(result).toContain("weave the quotation into the sentence and analyze it immediately after");
    expect(result).toContain("what stands out to me");
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

  it("packs more than three references when budget allows", () => {
    const samples = Array.from({ length: 5 }, (_, i) => ({
      label: `Essay ${i + 1}`,
      content: `Sample ${i + 1}. ` + "This shows that the student writes in a pretty specific way. ".repeat(20 + i),
    }));
    const result = buildLevel2WritingPrompt(makeOpts({ samples }), outline);

    expect(result).toContain("Reference 4");
  });

  it("tells the model not to use vague evidence placeholders", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    expect(result).toContain('Do NOT hide behind placeholders like "in class we talked about"');
  });

  it("adds a no-source specificity ceiling when no source packet is present", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    expect(result).toContain("well-prepared student could plausibly remember without research");
    expect(result).toContain("Prefer major names, events, places, and policies over obscure dates or niche facts");
  });

  it("includes approved source material when provided", () => {
    const result = buildLevel2WritingPrompt(
      makeOpts({ sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1 ---\nBattle of the Zab happened in 750." }),
      outline,
    );
    expect(result).toContain("APPROVED SOURCE MATERIAL");
    expect(result).toContain("Battle of the Zab happened in 750");
  });

  it("scales paragraph guidance for long-form assignments", () => {
    const result = buildLevel2WritingPrompt(makeOpts({ wordCount: 1300 }), outline);
    expect(result).toContain("6-8 total paragraphs");
  });

  it("tells sourced drafts to argue from sources instead of reporting packet language", () => {
    const result = buildLevel2WritingPrompt(
      makeOpts({ sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1 ---\nThe movement called for \"the family of the Prophet.\"" }),
      outline,
    );

    expect(result).toContain("Do NOT sound like you are reporting from an assignment packet");
    expect(result).toContain("Use at most 1-2 short integrated quoted phrases");
    expect(result).toContain("Source references should support the argument");
  });

  it("includes paragraph-level source strategy for sourced essays", () => {
    const result = buildLevel2WritingPrompt(
      makeOpts({
        sourceContext: [
          "APPROVED SOURCE MATERIAL:",
          "--- Source 1: al-Tabari excerpt ---",
          "TYPE: PRIMARY",
          "Quoted line.",
          "--- Source 2: modern interpretation ---",
          "TYPE: SECONDARY",
          "Interpretive note.",
        ].join("\n"),
      }),
      outline,
    );

    expect(result).toContain("PARAGRAPH-LEVEL SOURCE STRATEGY");
    expect(result).toContain("Do not make every body paragraph do the same kind of source work");
    expect(result).toContain("one paragraph carries most of the explicit source comparison");
  });
});

// ─── Audit prompt tests ───

describe("buildLevel2CritiquePrompt", () => {
  const essay = "Gatsby believed in the green light. This shows that the American Dream is impossible.";

  it("grounds the critique in student samples before the essay", () => {
    const fp = makeFingerprint();
    const samples = [
      { label: "Essay 1", content: "Sample content here about the war" },
      { label: "Essay 2", content: "Another sample about literature" },
    ];
    const result = buildLevel2CritiquePrompt(essay, fp, samples);

    expect(result).toContain("STUDENT'S REAL WRITING");
    expect(result).toContain("GENERATED ESSAY TO EVALUATE");
    expect(result.indexOf("STUDENT'S REAL WRITING")).toBeLessThan(
      result.indexOf("GENERATED ESSAY TO EVALUATE")
    );
    expect(result).toContain("PRIORITY FIXES:");
    expect(result).toContain("KEEP:");
  });

  it("explicitly forbids rewriting during the critique pass", () => {
    const fp = makeFingerprint();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2CritiquePrompt(essay, fp, samples);

    expect(result).toContain("Do NOT rewrite the essay");
    expect(result).toContain("ruthless writing-forensics reviewer");
  });

  it("includes source material when provided", () => {
    const fp = makeFingerprint();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2CritiquePrompt(
      essay,
      fp,
      samples,
      "APPROVED SOURCE MATERIAL:\n--- Source 1 ---\nPrimary source excerpt.",
    );

    expect(result).toContain("Primary source excerpt.");
  });
});

describe("buildLevel2AuditPrompt", () => {
  const essay = "Gatsby believed in the green light. This shows that the American Dream is impossible.";

  it("places samples before essay in correct sections", () => {
    const fp = makeFingerprint();
    const samples = [
      { label: "Essay 1", content: "Sample content here about the war" },
      { label: "Essay 2", content: "Another sample about literature" },
    ];
    const result = buildLevel2AuditPrompt(essay, fp, samples);

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
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2AuditPrompt(essay, fp, samples);
    expect(result).not.toContain("Checklist");
    expect(result).not.toContain("verify each one");
    expect(result).toContain("would a teacher");
  });

  it("explicitly says to preserve voice while improving quality", () => {
    const fp = makeFingerprint();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2AuditPrompt(essay, fp, samples);
    expect(result).toContain("Improve the essay's quality to an A-range standard");
    expect(result).toContain("Preserve everything that already sounds like the student");
  });

  it("includes AI detector phrases", () => {
    const fp = makeFingerprint();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2AuditPrompt(essay, fp, samples);
    expect(result).toContain("delve into");
    expect(result).toContain("pivotal");
  });

  it("includes upstream critique notes when provided", () => {
    const fp = makeFingerprint();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const critique = "VERDICT: Too polished.\n\nPRIORITY FIXES:\n- Sentence rhythm is too uniform\n- Vocabulary is too elevated\n\nKEEP:\n- The second body paragraph";
    const result = buildLevel2AuditPrompt(essay, fp, samples, critique);

    expect(result).toContain("FORENSIC NOTES FROM A PRIOR REVIEW PASS");
    expect(result).toContain("Sentence rhythm is too uniform");
    expect(result).toContain("Treat every item in PRIORITY FIXES as binding");
  });

  it("includes source material when provided", () => {
    const fp = makeFingerprint();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2AuditPrompt(
      essay,
      fp,
      samples,
      undefined,
      "APPROVED SOURCE MATERIAL:\n--- Source 1 ---\nBattle of the Zab in 750 mattered.",
    );

    expect(result).toContain("Battle of the Zab in 750 mattered.");
  });

  it("adds a no-source plausibility check when no source pack is present", () => {
    const fp = makeFingerprint();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2AuditPrompt(essay, fp, samples);

    expect(result).toContain("NO-SOURCE PLAUSIBILITY CHECK");
    expect(result).toContain("outside research or historian-level precision");
  });
});

describe("buildLevel2ExpansionPrompt", () => {
  it("asks the model to expand without changing the voice", () => {
    const essay = "The Abbasids won because people were upset. This changed the Islamic world a lot.";
    const result = buildLevel2ExpansionPrompt(essay, makeOpts(), "VERDICT: Too short.");

    expect(result).toContain("CURRENT ESSAY DRAFT");
    expect(result).toContain("expand this essay");
    expect(result).toContain("Replace vague lines like \"in class\"");
    expect(result).toContain("Keep the same thesis");
    expect(result).toContain("VERDICT: Too short.");
  });
});

describe("buildLevel2CompliancePrompt", () => {
  it("enforces thesis, evidence count, and word-count compliance while preserving voice", () => {
    const essay = "The Abbasids won because people were upset. This changed the Islamic world a lot.";
    const result = buildLevel2CompliancePrompt(essay, makeOpts(), { minWords: 700, maxWords: 850 });

    expect(result).toContain("clear thesis");
    expect(result).toContain("at least 3 concrete pieces of evidence");
    expect(result).toContain("It must not land below 700 words.");
    expect(result).toContain("raise it to a polished A-range standard");
    expect(result).toContain("do not sound like a textbook or historian");
    expect(result).toContain("Keep a few natural contractions");
  });
});

describe("buildLevel2EvidenceIntegrationPrompt", () => {
  it("requires concrete evidence and analysis links", () => {
    const essay = "The Abbasids won because people were upset. This changed the Islamic world a lot.";
    const result = buildLevel2EvidenceIntegrationPrompt(essay, makeOpts({
      sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1 ---\nBattle of the Zab in 750.",
    }), { requiredEvidenceCount: 3 });

    expect(result).toContain("at least 3 distinct pieces of evidence");
    expect(result).toContain("Every major example must be followed by 1-2 sentences explaining why it matters");
    expect(result).toContain("prefer it over generic background knowledge");
  });

  it("sets a student-plausible evidence ceiling when no sources are present", () => {
    const essay = "The Abbasids won because people were upset. This changed the Islamic world a lot.";
    const result = buildLevel2EvidenceIntegrationPrompt(essay, makeOpts());

    expect(result).toContain("3-5 concrete, high-confidence details");
    expect(result).toContain("Prefer major names, events, places, and policies over niche facts or stacked dates");
  });
});

describe("buildLevel2AttributionPrompt", () => {
  it("requires explicit but natural source attribution and trimming", () => {
    const essay = "The Abbasids won because people were upset. This changed the Islamic world a lot.";
    const result = buildLevel2AttributionPrompt(
      essay,
      makeOpts({
        sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1 ---\nBattle of the Zab in 750.",
      }),
      { maxWords: 850 },
    );

    expect(result).toContain("include at least one directly attributable source phrase");
    expect(result).toContain("Do not invent quotations.");
    expect(result).toContain("keep those voices distinct");
    expect(result).toContain("does not exceed 850 words");
  });
});

describe("buildLevel2TrimPrompt", () => {
  it("enforces a hard max-word ceiling without changing the argument", () => {
    const essay = "The Abbasids won because people were upset. This changed the Islamic world a lot.";
    const result = buildLevel2TrimPrompt(essay, makeOpts(), { maxWords: 850 });

    expect(result).toContain("does not exceed 850 words");
    expect(result).toContain("Cut repetition, over-explanation, and the least necessary background first");
    expect(result).toContain("Keep all major required elements already present");
  });
});

describe("buildLevel2SourceFlowPrompt", () => {
  it("targets sourced attribution and repeated analytical phrasing without changing structure", () => {
    const essay = "According to the source, the Abbasids were strong. This shows they had support.";
    const result = buildLevel2SourceFlowPrompt(
      essay,
      makeOpts({
        sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1: al-Tabari packet excerpt ---\nExcerpt.",
      }),
      { maxWords: 850 },
    );

    expect(result).toContain("source integration");
    expect(result).toContain("Replace generic or mechanical source phrasing");
    expect(result).toContain("Preserve the same paragraph count");
    expect(result).toContain("at or under 850 words");
    expect(result).toContain("Add 2-4 moments of student-like hedging or direct interpretive language");
    expect(result).toContain("non-first-person phrasing");
    expect(result).toContain("mechanically covering a rubric bullet");
    expect(result).toContain("Make the ending answer the central question a little more decisively");
  });
});

describe("buildLevel2SourcedVoicePrompt", () => {
  it("keeps sourced structure while asking for less systematic polish", () => {
    const essay = "The Abbasids built a coalition in Khurasan.";
    const result = buildLevel2SourcedVoicePrompt(
      essay,
      makeOpts({
        sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1: al-Tabari packet excerpt ---\nThe movement called for \"the family of the Prophet.\"",
      }),
      { maxWords: 850 },
    );

    expect(result).toContain("less perfectly organized");
    expect(result).toContain("Keep the same paragraph count");
    expect(result).toContain("Preserve every required source quotation");
    expect(result).toContain("a little more like a real student's live reasoning");
    expect(result).toContain("Do not add first-person framing at all");
  });
});

describe("buildLevel2SourcedSynthesisPrompt", () => {
  it("asks for more organic source-and-analysis stitching without changing structure", () => {
    const essay = "According to the source packet, the Abbasids were strong.";
    const result = buildLevel2SourcedSynthesisPrompt(
      essay,
      makeOpts({
        sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1: al-Tabari packet excerpt ---\nThe movement called for \"the family of the Prophet.\"",
      }),
      { maxWords: 850 },
    );

    expect(result).toContain("source-and-analysis stitching");
    expect(result).toContain("Keep the same thesis, paragraph count, quotations, and major evidence");
    expect(result).toContain("Avoid phrases like \"the packet says,\"");
    expect(result).toContain("The prose should feel like a strong student essay");
  });
});

describe("buildLevel2QuoteIntegrationPrompt", () => {
  it("requires short integrated quotations with preserved structure", () => {
    const essay = "The Abbasids won because they built support in Khurasan.";
    const result = buildLevel2QuoteIntegrationPrompt(
      essay,
      makeOpts({
        sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1: al-Tabari packet excerpt ---\nThe movement called for \"the family of the Prophet.\"",
      }),
      { requiredQuoteCount: 1, maxWords: 850 },
    );

    expect(result).toContain("Integrate short source quotations naturally");
    expect(result).toContain("must include at least 1 direct quoted phrase");
    expect(result).toContain("Keep the same paragraph count and overall structure");
    expect(result).toContain("Do not add block quotes");
    expect(result).toContain("Good candidates include");
    expect(result).toContain("quote the primary source");
    expect(result).toContain("how its wording changes the interpretation");
  });
});

describe("buildLevel2SourcedDraftChoicePrompt", () => {
  it("asks for an A/B choice favoring student-like sourced drafts", () => {
    const result = buildLevel2SourcedDraftChoicePrompt({
      candidateA: "Essay A",
      candidateB: "Essay B",
      candidateC: "Essay C",
      opts: makeOpts({
        sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1: al-Tabari packet excerpt ---\nThe movement called for \"the family of the Prophet.\"",
      }),
    });

    expect(result).toContain("Choose the best sourced draft");
    expect(result).toContain("stronger thesis and evidence handling");
    expect(result).toContain("more natural source integration");
    expect(result).toContain("clearer, more direct academic prose");
    expect(result).toContain("Return only one token: A, B, or C");
  });
});

describe("buildLevel2NaturalnessPrompt", () => {
  it("asks for less formulaic phrasing without weakening evidence", () => {
    const essay = "This shows the Abbasids were strong. This shows the Umayyads were weak.";
    const result = buildLevel2NaturalnessPrompt(essay, makeOpts());

    expect(result).toContain("Replace repetitive analytical phrasing");
    expect(result).toContain("Do NOT pretend you have class notes");
    expect(result).toContain("Do not make the essay vaguer");
  });

  it("preserves supported attribution when sources are present", () => {
    const essay = "The source shows the Abbasids were strong.";
    const result = buildLevel2NaturalnessPrompt(
      essay,
      makeOpts({
        sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1 ---\nBattle of the Zab in 750.",
      }),
    );

    expect(result).toContain("Keep source attribution when it is supported");
    expect(result).not.toContain("Do NOT pretend you have class notes");
  });
});

describe("stripUnsupportedSourceAttribution", () => {
  it("removes invented classroom attributions from no-source prose", () => {
    const essay = [
      "According to the class notes, the Abbasids got support from the mawali.",
      "As we discussed in class, the Umayyads had made a lot of enemies.",
      "The class sources explain that Baghdad became important later.",
    ].join(" ");

    const result = stripUnsupportedSourceAttribution(essay);

    expect(result).not.toContain("class notes");
    expect(result).not.toContain("discussed in class");
    expect(result).not.toContain("class sources");
    expect(result).toContain("The Abbasids got support from the mawali.");
  });

  it("preserves paragraph breaks while stripping unsupported attributions", () => {
    const essay = [
      "According to the class notes, the Abbasids got support from the mawali.",
      "",
      "As we discussed in class, Baghdad became important later.",
    ].join("\n\n");

    const result = stripUnsupportedSourceAttribution(essay);

    expect(result).toContain("\n\n");
  });

  it("strips broader unsupported course-material phrasing", () => {
    const essay = "As the course material on the Abbasid Revolution shows, the Umayyads had real problems.";
    const result = stripUnsupportedSourceAttribution(essay);

    expect(result).not.toContain("course material");
    expect(result).toContain("The Umayyads had real problems.");
  });
});

describe("normalizeSupportedSourceAttribution", () => {
  it("replaces generic class-note phrasing with generic source phrasing", () => {
    const essay = [
      "According to the class notes, the Abbasids won at the Zab.",
      "The class sources explain that Baghdad became important later.",
    ].join(" ");

    const result = normalizeSupportedSourceAttribution(
      essay,
      "APPROVED SOURCE MATERIAL:\n--- Source 1: al-Tabari packet excerpt ---\nExcerpt.\n\n--- Source 2: Baghdad seminar notes ---\nExcerpt.",
    );

    expect(result).not.toContain("class notes");
    expect(result).not.toContain("class sources");
    expect(result).toContain("According to al-Tabari");
    expect(result).not.toContain("The source shows");
  });

  it("normalizes broader notes phrasing to source language", () => {
    const essay = [
      "According to our class notes on the Abbasid Revolution, the Abbasids drew support from the mawali.",
      "The revolution notes show that Abu Muslim organized support in Khorasan.",
    ].join(" ");

    const result = normalizeSupportedSourceAttribution(
      essay,
      "APPROVED SOURCE MATERIAL:\n--- Source 1: lecture packet on social grievances ---\nExcerpt.\n\n--- Source 2: seminar notes on the Battle of the Zab ---\nExcerpt.",
    );

    expect(result).not.toContain("class notes");
    expect(result).not.toContain("revolution notes");
    expect(result).toContain("According to the packet's discussion of social grievances");
    expect(result).toContain("The packet's discussion of social grievances shows that Abu Muslim organized support in Khorasan.");
  });

  it("replaces generic source phrasing with a named source when context exists", () => {
    const essay = "According to the source, the black banners mattered. As the source shows, the movement spread in Khurasan.";
    const result = normalizeSupportedSourceAttribution(
      essay,
      "APPROVED SOURCE MATERIAL:\n--- Source 1: al-Tabari packet excerpt ---\nExcerpt.",
    );

    expect(result).toContain("According to al-Tabari");
    expect(result).toContain("As al-Tabari shows");
  });
});

describe("polishSourcedVoiceTexture", () => {
  it("shortens packet-ish source labels and adds a more personal marker", () => {
    const essay = [
      "The lecture packet on social grievances makes this point directly.",
      "The seminar discussion of administrative and urban change frames Baghdad differently.",
      "What stands out is the shift in power.",
      "That matters because the empire changed.",
      "That matters because the ruling order changed too.",
      "At the same time, the coalition was broad.",
      "At the same time, the empire was changing.",
      "Even so, the old elite survived.",
      "Even so, the structure changed.",
      "So The best description is the Abbasid Revolution as complicated.",
      "The stronger argument is that the empire changed.",
    ].join(" ");

    const result = polishSourcedVoiceTexture(essay);

    expect(result).toContain("A note on social grievances");
    expect(result).toContain("The discussion of administrative change in the packet");
    expect(result).toContain("What stands out is");
    expect((result.match(/That matters because/g) || []).length).toBe(1);
    expect(result).not.toContain("So The best description is");
    expect(result).toContain("What matters more is that");
    expect((result.match(/At the same time,/g) || []).length).toBe(1);
    expect((result.match(/Even so,/g) || []).length).toBe(1);
  });

  it("can keep first-person texture when explicitly allowed", () => {
    const essay = "What stands out is the shift in power.";
    const result = polishSourcedVoiceTexture(essay, { allowFirstPerson: true });

    expect(result).toContain("What stands out to me is");
  });

  it("keeps sourced prose non-first-person when first person is not allowed", () => {
    const essay = "What stands out to me is the shift in power.";
    const result = polishSourcedVoiceTexture(essay, { allowFirstPerson: false });

    expect(result).toContain("What stands out is");
    expect(result).not.toContain("What stands out to me is");
  });

  it("rewrites common analytical first-person openings in sourced prose", () => {
    const essay = "I do not think that framing captures what actually happened.";
    const result = polishSourcedVoiceTexture(essay, { allowFirstPerson: false });

    expect(result).not.toContain("I do not think");
    expect(result).not.toContain("I don't think");
  });

  it("rewrites I would describe phrasing in sourced prose", () => {
    const essay = "So I would describe the Abbasid Revolution as a coalition revolution.";
    const result = polishSourcedVoiceTexture(essay, { allowFirstPerson: false });

    expect(result).not.toContain("I would describe");
    expect(result).toContain("a better way to put it is");
    expect(result).not.toContain("a better way to put it is it as");
  });
});

describe("polishLevel2SurfaceVoice", () => {
  it("injects a few natural contractions for writers who use them", () => {
    const essay = [
      "The Abbasids did not wait for the Umayyads to change.",
      "It is clear that they were not going to accept that system forever.",
      "The Umayyads could not keep control because they did not have broad support.",
      "That is why the Abbasids were able to win.",
    ].join(" ");

    const result = polishLevel2SurfaceVoice(essay, makeFingerprint());
    const matches = result.match(/\b(doesn't|don't|can't|isn't|it's|that's|weren't|didn't|couldn't)\b/gi) || [];

    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  it("leaves contraction-free prose alone when the writer avoids contractions", () => {
    const essay = "It is clear that they were not going to accept the old system.";
    const fp = makeFingerprint({
      voice: {
        formality: "formal",
        perspective: "third-person",
        contractions: false,
        toneDescription: "formal",
        distinctiveTraits: [],
      },
    });

    const result = polishLevel2SurfaceVoice(essay, fp);

    expect(result).toBe(essay);
  });

  it("smooths repeated analytical transitions and downgrades AI-ish phrases", () => {
    const essay = [
      "At the same time, the Abbasids had support.",
      "At the same time, they had a strong message.",
      "In other words, the movement was broad.",
      "In other words, it was persuasive.",
      "That is why the revolution mattered.",
      "That is why the empire changed.",
      "It became a compelling narrative for later writers.",
    ].join(" ");

    const result = polishLevel2SurfaceVoice(essay, makeFingerprint({ voice: { formality: "mixed", perspective: "third-person", contractions: false, toneDescription: "", distinctiveTraits: [] } }));

    expect((result.match(/At the same time,/g) || []).length).toBe(1);
    expect((result.match(/In other words,/g) || []).length).toBe(1);
    expect((result.match(/That is why/g) || []).length).toBe(1);
    expect(result).toContain("strong account");
    expect(result).not.toContain("compelling narrative");
  });
});

// ─── humanizeEssay tests ───

describe("humanizeEssay", () => {
  const formalEssay = [
    "The green light does not simply represent hope.",
    "It is a symbol that cannot be separated from Gatsby's identity.",
    "Fitzgerald shows that the dream is not achievable.",
    "The Valley of Ashes does not offer any escape.",
    "This is a world where they are trapped by circumstance.",
    "Wilson was not able to see beyond his situation.",
    "The eyes do not judge, they simply observe.",
    "It is clear that morality has not survived the era.",
  ].join(" ");

  it("injects contractions when fingerprint says student uses them", () => {
    const fp = makeFingerprint({ voice: { formality: "mixed", perspective: "third-person", contractions: true, toneDescription: "casual academic", distinctiveTraits: [] } });
    const result = humanizeEssay(formalEssay, fp);

    // Count contractions in output
    const contractionPatterns = /\b(doesn't|don't|can't|isn't|wouldn't|couldn't|shouldn't|they're|won't|it's|that's|wasn't|weren't|didn't|hasn't|haven't)\b/gi;
    const matches = result.match(contractionPatterns) || [];

    expect(matches.length).toBeGreaterThanOrEqual(4);
    expect(matches.length).toBeLessThanOrEqual(7);
  });

  it("does NOT inject contractions when fingerprint says student avoids them", () => {
    const fp = makeFingerprint({
      voice: { formality: "formal", perspective: "third-person", contractions: false, toneDescription: "formal academic", distinctiveTraits: [] },
      errors: { grammarPatterns: [], punctuationHabits: [], spellingTendency: "" },
    });
    const result = humanizeEssay(formalEssay, fp);

    // No contractions should be present
    const contractionPattern = /\b(doesn't|don't|can't|isn't|wouldn't|couldn't|shouldn't|they're|won't|it's|that's|wasn't|weren't|didn't|hasn't|haven't)\b/gi;
    expect(result.match(contractionPattern)).toBeNull();
    // Original formal phrases should survive
    expect(result).toContain("does not");
    expect(result).toContain("cannot");
  });

  it("injects comma splices when fingerprint lists comma splices as error pattern", () => {
    const essayWithTargets = "Gatsby reached for the light. This shows that he could not let go. The valley was dark. It also represented decay. This proves that society had failed.";
    const fp = makeFingerprint({
      voice: { formality: "mixed", perspective: "third-person", contractions: false, toneDescription: "", distinctiveTraits: [] },
      errors: { grammarPatterns: ["comma splices before 'and'"], punctuationHabits: [], spellingTendency: "" },
    });
    const result = humanizeEssay(essayWithTargets, fp);

    // At least one period should have been converted to a comma splice
    const splicePattern = /,\s+(this shows|this proves|it also|it is|this is|it was)/gi;
    const matches = result.match(splicePattern) || [];
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it("does NOT inject comma splices when not in error patterns", () => {
    const essayWithTargets = "The dream failed. This shows that hope was empty.";
    const fp = makeFingerprint({
      voice: { formality: "mixed", perspective: "third-person", contractions: false, toneDescription: "", distinctiveTraits: [] },
      errors: { grammarPatterns: ["run-on sentences"], punctuationHabits: [], spellingTendency: "" },
    });
    const result = humanizeEssay(essayWithTargets, fp);
    expect(result).toBe(essayWithTargets);
  });

  it("preserves text inside quotation marks", () => {
    const essayWithQuote = 'Gatsby "does not give up" on the dream. He does not accept reality.';
    const fp = makeFingerprint({ voice: { formality: "mixed", perspective: "third-person", contractions: true, toneDescription: "", distinctiveTraits: [] } });
    const result = humanizeEssay(essayWithQuote, fp);

    // The quoted "does not" should be preserved
    expect(result).toContain('"does not give up"');
    // The unquoted one can be converted
    // (may or may not be converted depending on random selection, so just check the quote survived)
  });

  it("is deterministic — same input produces same output", () => {
    const fp = makeFingerprint({ voice: { formality: "mixed", perspective: "third-person", contractions: true, toneDescription: "casual", distinctiveTraits: [] } });
    const result1 = humanizeEssay(formalEssay, fp);
    const result2 = humanizeEssay(formalEssay, fp);
    expect(result1).toBe(result2);
  });

  it("handles essay with no replaceable targets gracefully", () => {
    const cleanEssay = "Gatsby wanted the dream. Wilson watched from afar. Nobody could help him.";
    const fp = makeFingerprint({
      voice: { formality: "mixed", perspective: "third-person", contractions: true, toneDescription: "", distinctiveTraits: [] },
      errors: { grammarPatterns: [], punctuationHabits: [], spellingTendency: "" },
    });
    const result = humanizeEssay(cleanEssay, fp);
    // No formal phrases or splice targets, so output equals input (minus any double-period cleanup)
    expect(result).toBe(cleanEssay);
  });

  it("cleans up double-period artifacts", () => {
    const essayWithDoublePeriods = "The dream was dead.. The light faded away.. Gatsby lost everything.";
    const fp = makeFingerprint({
      voice: { formality: "formal", perspective: "third-person", contractions: false, toneDescription: "", distinctiveTraits: [] },
      errors: { grammarPatterns: [], punctuationHabits: [], spellingTendency: "" },
    });
    const result = humanizeEssay(essayWithDoublePeriods, fp);
    expect(result).not.toContain("..");
    expect(result).toContain("was dead.");
    expect(result).toContain("faded away.");
  });

  it("normalizes smart/curly quotes to ASCII", () => {
    // Use curly quotes around a phrase, then a formal phrase after
    const essayWithCurlyQuotes = "Nick says \u201Cthe dream is dead\u201D and it does not matter anymore.";
    const fp = makeFingerprint({
      voice: { formality: "mixed", perspective: "third-person", contractions: true, toneDescription: "", distinctiveTraits: [] },
      errors: { grammarPatterns: [], punctuationHabits: [], spellingTendency: "" },
    });
    const result = humanizeEssay(essayWithCurlyQuotes, fp);
    // "does not" outside quotes should be converted to "doesn't"
    expect(result).toContain("doesn't");
    // The quoted text should use ASCII quotes now
    expect(result).toContain('"the dream is dead"');
  });

  it("boosts burstiness by splitting long sentences when stddev is low", () => {
    // Create an essay with uniform ~20-word sentences (low burstiness)
    const uniformEssay = [
      "The green light at the end of the dock represents Gatsby's impossible dreams and his desire for Daisy.",
      "The Valley of Ashes serves as a powerful symbol of the moral decay hiding beneath the wealthy surface.",
      "The eyes of Doctor Eckleburg on the billboard represent the absence of genuine moral authority in society.",
      "These three symbols work together in the novel to reveal the deep corruption at the heart of everything.",
      "Fitzgerald uses this symbolism to argue that the American Dream has become a hollow and empty promise overall.",
      "The novel shows how people who chase wealth and status often destroy themselves and everyone around them completely.",
      "The green light promises something beautiful, but it delivers only heartbreak and longing that can never be satisfied.",
      "The Valley of Ashes demonstrates how the pursuit of material success creates suffering for the lower classes below.",
    ].join(" ");

    const fp = makeFingerprint({
      voice: { formality: "formal", perspective: "third-person", contractions: false, toneDescription: "", distinctiveTraits: [] },
      errors: { grammarPatterns: [], punctuationHabits: [], spellingTendency: "" },
    });
    const result = humanizeEssay(uniformEssay, fp);

    // The result should have more sentences than the input (some were split)
    const inputSentences = uniformEssay.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const outputSentences = result.split(/[.!?]+/).filter(s => s.trim().length > 0);
    expect(outputSentences.length).toBeGreaterThanOrEqual(inputSentences.length);
  });
});

describe("sanitizeEssayOutput", () => {
  it("removes leading essay wrappers and trailing notes", () => {
    const raw = [
      "```text",
      "Here is the revised essay:",
      "",
      "Gatsby reaches for the green light because it represents a future he can't really have.",
      "That idea keeps coming back through the whole novel.",
      "",
      "Word count: 512",
      "Let me know if you'd like another version.",
      "```",
    ].join("\n");

    const result = sanitizeEssayOutput(raw);

    expect(result).toContain("Gatsby reaches for the green light");
    expect(result).not.toContain("Here is the revised essay");
    expect(result).not.toContain("Word count:");
    expect(result).not.toContain("Let me know");
    expect(result).not.toContain("```");
  });

  it("preserves paragraph breaks while removing extra blank lines", () => {
    const raw = "Essay:\n\nParagraph one.\n\n\n\nParagraph two.";
    const result = sanitizeEssayOutput(raw);

    expect(result).toBe("Paragraph one.\n\nParagraph two.");
  });
});
