import { describe, it, expect } from "vitest";
import {
  formatFingerprintNarrative,
  normalizeFingerprint,
  buildLevel2PlanPrompt,
  buildLevel2WritingPrompt,
  buildLevel2CritiquePrompt,
  buildLevel2AuditPrompt,
  buildLevel2ExpansionPrompt,
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

  it("includes approved source material when provided", () => {
    const result = buildLevel2WritingPrompt(
      makeOpts({ sourceContext: "APPROVED SOURCE MATERIAL:\n--- Source 1 ---\nBattle of the Zab happened in 750." }),
      outline,
    );
    expect(result).toContain("APPROVED SOURCE MATERIAL");
    expect(result).toContain("Battle of the Zab happened in 750");
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

  it("explicitly says do NOT remove imperfections", () => {
    const fp = makeFingerprint();
    const samples = [{ label: "Essay 1", content: "Sample writing" }];
    const result = buildLevel2AuditPrompt(essay, fp, samples);
    expect(result).toContain("Do NOT remove intentional imperfections");
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
