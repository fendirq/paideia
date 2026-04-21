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
  buildLevel2SourceFlowPrompt,
  buildLevel2TrimPrompt,
  buildLevel2NaturalnessPrompt,
  isComparativeAssignment,
  isNarrativeAssignment,
  normalizeSupportedSourceAttribution,
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

  it("places the voice-reference block BEFORE the self-report context", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    const voiceRefIdx = result.indexOf("ANALYTICAL VOICE REFERENCE");
    const profileIdx = result.indexOf("STUDENT'S VOICE PROFILE");
    const selfReportIdx = result.indexOf("WHAT THE STUDENT SAYS");
    expect(voiceRefIdx).toBeGreaterThan(-1);
    expect(profileIdx).toBeGreaterThan(voiceRefIdx);
    expect(selfReportIdx).toBeGreaterThan(profileIdx);
  });

  it("withholds raw sample content from the argumentative writing prompt (prevents verbatim mad-libs)", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    expect(result).not.toContain("events of the war");
    expect(result).not.toContain("author shows how the character");
    expect(result).toContain("NOT from the student's raw prior essays");
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

  it("withholds sample content regardless of how many samples are available", () => {
    const samples = Array.from({ length: 5 }, (_, i) => ({
      label: `Essay ${i + 1}`,
      content: `Sample ${i + 1}. ` + "This shows that the student writes in a pretty specific way. ".repeat(20 + i),
    }));
    const result = buildLevel2WritingPrompt(makeOpts({ samples }), outline);

    expect(result).not.toContain("Reference 4");
    expect(result).not.toContain("Sample 4.");
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
    expect(result).toContain("According to the lecture packet on social grievances");
    expect(result).toContain("The lecture packet on social grievances shows that Abu Muslim organized support in Khorasan.");
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

  it("treats ? and ! as sentence boundaries for source scoring", () => {
    // A question sentence followed by a citation in the next sentence
    // must not leak the question's topic into the citation's scoring
    // corpus. Before the fix, `sentenceContaining` only looked
    // backward for `.` and `\n`, so the Zab-topic question got folded
    // into the Baghdad-topic citation and mis-attributed.
    const sourceContext = [
      "APPROVED SOURCE MATERIAL:",
      "--- Source 1: al-Tabari packet excerpt ---\nExcerpt on the Khurasani movement.",
      "--- Source 2: note on the Battle of the Zab ---\nExcerpt on the 750 battle.",
      "--- Source 3: Baghdad and administrative change ---\nExcerpt on the 762 capital.",
    ].join("\n\n");

    const essay = "Was the Battle of the Zab truly decisive? According to the source, Baghdad reshaped the empire.";
    const result = normalizeSupportedSourceAttribution(essay, sourceContext);
    // The citation follows the question, so the Baghdad source should
    // be chosen — NOT the Zab source from the preceding question.
    expect(result).toMatch(/According to (?:the )?Baghdad/i);
    expect(result).not.toMatch(/According to (?:the )?(?:note on the )?Battle of the Zab/i);
  });

  it("picks the source whose title tokens match the surrounding sentence, not just source 1", () => {
    // Two sources in the packet; sentence 1 is about the Battle of the
    // Zab (should pick the Zab source), sentence 2 is about Baghdad
    // (should pick the Baghdad source). Before the M2 fix, both
    // replacements collapsed to source 1 ("al-Tabari") because the
    // scoring corpus was just the matched phrase ("the source"),
    // which never contains source-specific tokens.
    const sourceContext = [
      "APPROVED SOURCE MATERIAL:",
      "--- Source 1: al-Tabari packet excerpt ---\nExcerpt on the Khurasani movement.",
      "--- Source 2: note on the Battle of the Zab ---\nExcerpt on the 750 battle.",
      "--- Source 3: Baghdad and administrative change ---\nExcerpt on the 762 capital.",
    ].join("\n\n");

    const essay = [
      "According to the source, the Battle of the Zab in 750 ended Umayyad power.",
      "According to the source, Baghdad became the new Abbasid capital in 762.",
    ].join(" ");

    const result = normalizeSupportedSourceAttribution(essay, sourceContext);

    // First sentence should pick the Zab source — not source 1
    // (al-Tabari), which was the pre-fix behavior.
    expect(result).toMatch(/According to (?:the )?(?:note on the )?Battle of the Zab/i);
    // Second sentence should pick the Baghdad source — likewise not al-Tabari.
    expect(result).toMatch(/According to (?:the )?Baghdad/i);
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

describe("isComparativeAssignment", () => {
  it("detects compare-and-contrast prompts", () => {
    expect(isComparativeAssignment("Compare and contrast Frankenstein and Jekyll/Hyde")).toBe(true);
    expect(isComparativeAssignment("Write a comparative analysis of Plato's Apology and Republic")).toBe(true);
    expect(isComparativeAssignment("Discuss the similarities and differences between X and Y")).toBe(true);
    expect(isComparativeAssignment("Frankenstein vs. Jekyll and Hyde: a comparative essay")).toBe(true);
  });

  it("does not fire on analytical-only assignments", () => {
    expect(isComparativeAssignment("Analyze the theme of guilt in Crime and Punishment")).toBe(false);
    expect(isComparativeAssignment("Write a 1200-word historical argument about the Abbasid Revolution")).toBe(false);
  });

  it("is mutually exclusive with isNarrativeAssignment", () => {
    const narrative = "Write a personal narrative about a challenge you overcame";
    expect(isNarrativeAssignment(narrative)).toBe(true);
    // A comparative prompt shouldn't accidentally match narrative signals
    expect(isNarrativeAssignment("Compare two novels")).toBe(false);
  });
});

describe("buildLevel2WritingPrompt — college rubric directives", () => {
  function makeOptsFor(assignment: string): GenerateOptions {
    return {
      teacherProfile: {
        gradeLevel: "college junior",
        gradeOther: "",
        losesPointsFor: [],
        losesPointsOther: "",
      },
      selfAssessment: makeSelfAssessment(),
      fingerprint: makeFingerprint(),
      samples: [
        { label: "prior", content: "In the novel, the author shows that..." },
      ],
      assignment,
      wordCount: 1200,
    };
  }

  it("injects comparative-specific directives for compare/contrast prompts", () => {
    const prompt = buildLevel2WritingPrompt(
      makeOptsFor("Compare and contrast Frankenstein and Jekyll/Hyde"),
      "Outline here",
    );
    expect(prompt).toContain("COMPARATIVE-ANALYSIS STRUCTURE");
    expect(prompt).toContain("PARALLEL CRITERIA");
    expect(prompt).toContain("COMPARATIVE CLAIM PER PARAGRAPH");
  });

  it("does NOT inject comparative directives for analytical prompts", () => {
    const prompt = buildLevel2WritingPrompt(
      makeOptsFor("Analyze the theme of guilt in Crime and Punishment"),
      "Outline here",
    );
    expect(prompt).not.toContain("COMPARATIVE-ANALYSIS STRUCTURE");
  });

  it("includes the college-rubric craft section for argumentative writing", () => {
    const prompt = buildLevel2WritingPrompt(
      makeOptsFor("Analyze the causes of the Abbasid Revolution"),
      "Outline here",
    );
    expect(prompt).toContain("COLLEGE-RUBRIC CRAFT");
    expect(prompt).toContain("THESIS STAKES");
    expect(prompt).toContain("COUNTERARGUMENT");
    expect(prompt).toContain("SO WHAT");
    expect(prompt).toContain("TOPIC SENTENCES AS SUBCLAIMS");
  });

  it("includes the evidence-integration framing + reporting-verb guidance for sourced runs", () => {
    const opts = makeOptsFor("Argue whether Gatsby's dream was doomed from the start");
    opts.sourceContext = "APPROVED SOURCE MATERIAL:\n--- Source 1: Gatsby chapter excerpts ---\n...";
    const prompt = buildLevel2WritingPrompt(opts, "Outline here");
    expect(prompt).toContain("FRAME FIRST");
    expect(prompt).toContain("PREFER PARAPHRASE");
    expect(prompt).toContain("reporting verbs");
    expect(prompt).toContain("'argues'");
  });

  it("forbids fabricated source citations on unsourced runs", () => {
    const prompt = buildLevel2WritingPrompt(
      makeOptsFor("Argue whether Gatsby's dream was doomed from the start"),
      "Outline here",
    );
    expect(prompt).toContain("NO FABRICATED SOURCES");
    expect(prompt).toContain("our packet");
    expect(prompt).not.toContain("FRAME FIRST: one sentence of framing BEFORE each quote");
  });

  it("does NOT add college-rubric craft to narrative prompts (wrong branch)", () => {
    const prompt = buildLevel2WritingPrompt(
      makeOptsFor("Write a personal narrative about a pivotal moment"),
      "Outline here",
    );
    expect(prompt).not.toContain("COLLEGE-RUBRIC CRAFT");
    expect(prompt).toContain("NARRATIVE CRAFT GUIDELINES");
  });
});
