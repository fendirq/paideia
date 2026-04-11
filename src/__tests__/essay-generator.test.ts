import { describe, it, expect } from "vitest";
import {
  formatFingerprintNarrative,
  normalizeFingerprint,
} from "@/lib/essay-generator";
import type { SelfAssessment, StyleFingerprint } from "@/lib/essay-generator";

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
    const result = formatFingerprintNarrative(fp, sa);

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
    const result = formatFingerprintNarrative(fp, sa);

    expect(result).toContain("shows");
    expect(result).toContain("proves");
    expect(result).toContain("juxtaposition");
  });

  it("includes transition favorites and avoids", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = formatFingerprintNarrative(fp, sa);

    expect(result).toContain("However");
    expect(result).toContain("Furthermore");
  });

  it("includes error patterns", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = formatFingerprintNarrative(fp, sa);

    expect(result).toContain("comma splices");
    expect(result).toContain("semicolons");
  });

  it("includes overall assessment", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = formatFingerprintNarrative(fp, sa);

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
    const result = formatFingerprintNarrative(fp, sa);

    expect(result).toBeTruthy();
    expect(result).toContain("basic");
  });
});
