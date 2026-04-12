# Level 2 Sample-First Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Level 2 essay generation pipeline to be sample-driven instead of rule-driven, producing more authentic and less AI-detectable output.

**Architecture:** Replace the 18-rule voice enforcement system with a sample-first approach where the student's actual writing samples are the primary input. The fingerprint becomes a readable narrative reference, and questionnaire data becomes context about the writer. The 3-pass structure (plan -> write -> audit) stays, but each pass gets new prompts.

**Tech Stack:** TypeScript, Anthropic SDK, Vitest, Next.js API routes

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/essay-generator.ts` | Modify | Replace 3 Level 2 prompt builders, add `formatFingerprintNarrative()`, update `selectDiverseSamples()`, delete `mapHabitsToInstructions()` |
| `src/app/api/portal/generate/route.ts` | Modify | Update imports, system prompts, Pass 2 message structure + temperature |
| `src/__tests__/essay-generator.test.ts` | Create | Unit tests for new prompt builders and `formatFingerprintNarrative()` |

---

### Task 1: Add unit tests for formatFingerprintNarrative

**Files:**
- Create: `src/__tests__/essay-generator.test.ts`

- [ ] **Step 1: Create the test file with tests for formatFingerprintNarrative**

```typescript
import { describe, it, expect } from "vitest";
import {
  formatFingerprintNarrative,
  normalizeFingerprint,
} from "@/lib/essay-generator";
import type { SelfAssessment, StyleFingerprint } from "@/lib/essay-generator";

// Minimal valid fingerprint for testing
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

    // Should NOT contain JSON syntax
    expect(result).not.toContain("{");
    expect(result).not.toContain("}");
    expect(result).not.toContain('"sentencePatterns"');

    // Should contain human-readable content
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

    // Should not throw and should still produce output
    expect(result).toBeTruthy();
    expect(result).toContain("basic");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx vitest run src/__tests__/essay-generator.test.ts`

Expected: FAIL — `formatFingerprintNarrative` is not exported from `@/lib/essay-generator`

- [ ] **Step 3: Commit test file**

```bash
git add src/__tests__/essay-generator.test.ts
git commit -m "test: add failing tests for formatFingerprintNarrative"
```

---

### Task 2: Implement formatFingerprintNarrative and update selectDiverseSamples

**Files:**
- Modify: `src/lib/essay-generator.ts`

- [ ] **Step 1: Add formatFingerprintNarrative after normalizeFingerprint (after line 303)**

```typescript
export function formatFingerprintNarrative(
  fp: StyleFingerprint,
  sa: SelfAssessment,
): string {
  const lines: string[] = [];

  lines.push(
    `Sentences: Averages ~${fp.sentencePatterns.averageLength} words per sentence with ${fp.sentencePatterns.variation} variation. ${fp.sentencePatterns.tendency}`,
  );

  lines.push(
    `Vocabulary: ${fp.vocabulary.tier} tier. ${fp.vocabulary.wordChoicePattern}`,
  );
  if (fp.vocabulary.signatureWords.length) {
    lines.push(
      `  Frequently uses: ${fp.vocabulary.signatureWords.join(", ")}`,
    );
  }
  if (fp.vocabulary.avoidedWords.length) {
    lines.push(`  Never uses: ${fp.vocabulary.avoidedWords.join(", ")}`);
  }

  if (fp.transitions.favorites.length) {
    lines.push(
      `Transitions: Favors ${fp.transitions.favorites.join(", ")}`,
    );
  }
  if (fp.transitions.neverUses.length) {
    lines.push(`  Avoids: ${fp.transitions.neverUses.join(", ")}`);
  }

  lines.push(
    `Structure: ${fp.structure.introPattern} Paragraphs typically ${fp.structure.avgParagraphLength} sentences. ${fp.structure.bodyParagraphPattern} ${fp.structure.conclusionPattern}`,
  );
  lines.push(`  Thesis placement: ${fp.structure.thesisPlacement}`);

  lines.push(
    `Evidence style: ${fp.evidenceStyle.method}. ${fp.evidenceStyle.analysisPattern} Analysis depth: ${fp.evidenceStyle.analysisDepth}. ${fp.evidenceStyle.citationHabits}`,
  );

  if (fp.errors.grammarPatterns.length || fp.errors.punctuationHabits.length) {
    const errorParts: string[] = [];
    if (fp.errors.grammarPatterns.length)
      errorParts.push(fp.errors.grammarPatterns.join(", "));
    if (fp.errors.punctuationHabits.length)
      errorParts.push(fp.errors.punctuationHabits.join(", "));
    lines.push(
      `Common errors: ${errorParts.join(". ")}${fp.errors.spellingTendency ? `. ${fp.errors.spellingTendency}` : ""}`,
    );
  }

  lines.push(
    `Voice: ${fp.voice.formality} formality, ${fp.voice.perspective} perspective. ${fp.voice.contractions ? "Uses contractions." : "Avoids contractions."} ${fp.voice.toneDescription}`,
  );
  if (fp.voice.distinctiveTraits.length) {
    lines.push(
      `  Distinctive traits: ${fp.voice.distinctiveTraits.join(", ")}`,
    );
  }

  lines.push(
    `Argumentation: ${fp.rhetoric.argumentStyle}. Counter-arguments: ${fp.rhetoric.counterArguments}. Assertiveness: ${fp.rhetoric.assertiveness}.`,
  );
  if (fp.rhetoric.hedgingLanguage.length) {
    lines.push(
      `  Hedging phrases: ${fp.rhetoric.hedgingLanguage.join(", ")}`,
    );
  }

  if (fp.rhythm.sentenceOpeners.length) {
    lines.push(
      `Sentence openers: ${fp.rhythm.sentenceOpeners.join(", ")}`,
    );
  }
  lines.push(
    `Paragraph rhythm: ${fp.rhythm.paragraphRhythm}. List usage: ${fp.rhythm.listUsage}.`,
  );

  if (fp.overallAssessment) {
    lines.push(`\nOverall: ${fp.overallAssessment}`);
  }

  return lines.join("\n");
}
```

- [ ] **Step 2: Update selectDiverseSamples default from 8000 to 12000**

Change line 227:

```typescript
// Before:
function selectDiverseSamples(samples: Sample[], maxChars = 8000): string {
// After:
function selectDiverseSamples(samples: Sample[], maxChars = 12000): string {
```

- [ ] **Step 3: Run tests to verify formatFingerprintNarrative passes**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx vitest run src/__tests__/essay-generator.test.ts`

Expected: All 6 tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/essay-generator.ts
git commit -m "feat: add formatFingerprintNarrative, increase sample budget to 12k chars"
```

---

### Task 3: Add tests for new Level 2 prompt builders

**Files:**
- Modify: `src/__tests__/essay-generator.test.ts`

- [ ] **Step 1: Update imports and add test helpers + new test blocks**

Update the imports at the top of the file (replace the existing import block) and add new test helpers and test blocks after the existing `formatFingerprintNarrative` describe block:

```typescript
// UPDATE the import block at the top of the file to:
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

// ADD these helpers after the existing makeSelfAssessment (keep makeFingerprint and makeSelfAssessment from Task 1)

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
    // Should contain readable narrative
    expect(result).toContain("Sentences:");
    expect(result).toContain("Vocabulary:");
  });

  it("presents questionnaire data as context, not rules", () => {
    const result = buildLevel2WritingPrompt(makeOpts(), outline);
    // Should NOT contain "MANDATORY" or "Rule" or numbered enforcement rules
    expect(result).not.toContain("VOICE ENFORCEMENT");
    expect(result).not.toContain("Each rule is mandatory");
    // Should contain context framing
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

describe("buildLevel2AuditPrompt", () => {
  const essay = "Gatsby believed in the green light. This shows that the American Dream is impossible.";

  it("includes student samples as reference standard", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const samples = [{ label: "Essay 1", content: "Sample content here" }];
    const result = buildLevel2AuditPrompt(essay, fp, samples, sa);
    expect(result).toContain("Sample content here");
    expect(result).toContain("STUDENT'S REAL WRITING");
  });

  it("includes the generated essay to audit", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = buildLevel2AuditPrompt(essay, fp, [], sa);
    expect(result).toContain("green light");
    expect(result).toContain("GENERATED ESSAY TO AUDIT");
  });

  it("uses forensic comparison framing, not checklist", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = buildLevel2AuditPrompt(essay, fp, [], sa);
    // Should NOT be checklist-based
    expect(result).not.toContain("Checklist");
    expect(result).not.toContain("verify each one");
    // Should be comparison-based
    expect(result).toContain("would a teacher");
  });

  it("explicitly says do NOT remove imperfections", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = buildLevel2AuditPrompt(essay, fp, [], sa);
    expect(result).toContain("Do NOT remove intentional imperfections");
  });

  it("includes AI detector phrases", () => {
    const fp = makeFingerprint();
    const sa = makeSelfAssessment();
    const result = buildLevel2AuditPrompt(essay, fp, [], sa);
    expect(result).toContain("delve into");
    expect(result).toContain("pivotal");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx vitest run src/__tests__/essay-generator.test.ts`

Expected: FAIL — `buildLevel2PlanPrompt`, `buildLevel2WritingPrompt`, `buildLevel2AuditPrompt` are not exported

- [ ] **Step 3: Commit failing tests**

```bash
git add src/__tests__/essay-generator.test.ts
git commit -m "test: add failing tests for Level 2 sample-first prompt builders"
```

---

### Task 4: Implement buildLevel2PlanPrompt

**Files:**
- Modify: `src/lib/essay-generator.ts`

- [ ] **Step 1: Replace buildLevel2OutlinePrompt with buildLevel2PlanPrompt**

Replace the function at lines 368-423 with:

```typescript
export function buildLevel2PlanPrompt(opts: GenerateOptions): string {
  const { teacherProfile: tp, selfAssessment: sa, assignment, wordCount, requirements } = opts;

  const gradeLevel = resolveValue(tp.gradeLevel, tp.gradeOther);
  const gradeRange = resolveValue(sa.gradeRange, sa.gradeRangeOther);
  const evidence = resolveValue(sa.evidenceApproach, sa.evidenceOther);
  const conclusion = resolveValue(sa.conclusionApproach, sa.conclusionOther);

  return `Create a structural outline for this essay assignment.

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}

TARGET WORD COUNT: ${wordCount}

STUDENT CONTEXT:
- Grade level: ${gradeLevel}
- Typical grade: ${gradeRange}
- Evidence approach: ${evidence}
- Conclusion approach: ${conclusion}

The outline should include:
- A thesis direction (not the exact wording)
- Number of body paragraphs and what each argues
- Which evidence or quotes to use in each paragraph
- A brief note on conclusion approach

Keep it structural. Do NOT include voice instructions, style notes, phrase placements, or writing tips. Structure only.`;
}
```

- [ ] **Step 2: Run the plan prompt tests**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx vitest run src/__tests__/essay-generator.test.ts -t "buildLevel2PlanPrompt"`

Expected: All 5 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/essay-generator.ts
git commit -m "feat: replace outline prompt with simplified plan prompt"
```

---

### Task 5: Implement buildLevel2WritingPrompt

**Files:**
- Modify: `src/lib/essay-generator.ts`

- [ ] **Step 1: Replace buildLevel2GenerationPrompt with buildLevel2WritingPrompt**

Replace the function at lines 427-493 (line numbers will have shifted after Task 4 — locate by function name `buildLevel2GenerationPrompt`) with:

```typescript
export function buildLevel2WritingPrompt(opts: GenerateOptions, outline: string): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, samples, assignment, wordCount, requirements } = opts;

  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint, sa);

  const gradeLevel = resolveValue(tp.gradeLevel, tp.gradeOther);
  const gradeRange = resolveValue(sa.gradeRange, sa.gradeRangeOther);
  const revision = resolveValue(sa.revisionLevel, sa.revisionOther);
  const evidence = resolveValue(sa.evidenceApproach, sa.evidenceOther);
  const conclusion = resolveValue(sa.conclusionApproach, sa.conclusionOther);
  const wordCountTendency = resolveValue(sa.wordCountTendency, sa.wordCountOther);
  const losesPoints = formatList(tp.losesPointsFor, tp.losesPointsOther);
  const habits = formatList(sa.writingHabits, sa.writingHabitsOther);

  const quoteIntros = formatList(sa.quoteIntroStyle ?? [], sa.quoteIntroOther);
  const overused = formatList(sa.overusedPhrases ?? [], sa.overusedPhrasesOther);
  const selfEdit = formatList(sa.selfEditFocus ?? [], sa.selfEditOther);
  const timeSpent = resolveValue(sa.timeSpentOn ?? "", sa.timeSpentOther ?? "");

  let revisionDescription = "";
  if (revision === "I submit my first draft as-is") {
    revisionDescription = "Essay should feel unpolished: rough transitions, occasional incomplete thoughts, uneven paragraph lengths.";
  } else if (revision === "I reread and fix obvious errors") {
    revisionDescription = "Essay should be mostly clean but with occasional awkward phrasing and underdeveloped analysis.";
  } else {
    revisionDescription = "Essay should feel more polished but still at their grade level.";
  }

  const selfReportedLines: string[] = [
    `- Grade level: ${gradeLevel}, typically earns ${gradeRange}`,
    `- Revision style: ${revision} — ${revisionDescription}`,
    `- Evidence approach: ${evidence}`,
    `- Conclusion approach: ${conclusion}`,
    `- Word count tendency: ${wordCountTendency}`,
    `- Known weaknesses (loses points for): ${losesPoints}`,
    `- Writing habits: ${habits}`,
  ];
  if (sa.quoteIntroStyle?.length || sa.quoteIntroOther) {
    selfReportedLines.push(`- They typically introduce quotes like: ${quoteIntros}`);
  }
  if (sa.overusedPhrases?.length || sa.overusedPhrasesOther) {
    selfReportedLines.push(`- They know they overuse these phrases: ${overused}`);
  }
  if (sa.selfEditFocus?.length || sa.selfEditOther) {
    selfReportedLines.push(`- When self-editing, they focus on fixing: ${selfEdit}`);
  }
  if (timeSpent) {
    selfReportedLines.push(`- They spend the most time polishing: ${timeSpent}`);
  }

  return `THEIR ACTUAL WRITING — study this carefully before you begin. This is how they really write:

${refSamples}

Read the samples above multiple times. Notice how they build paragraphs, how long their sentences are, how they introduce evidence, what transitions they use, what mistakes they make, how sophisticated (or not) their vocabulary is. You must write the way THEY write.

---

WRITER'S PROFILE (analyst's notes on this student's patterns):

${narrative}

---

WHAT THE STUDENT SAYS ABOUT THEMSELVES:

${selfReportedLines.join("\n")}

---

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}

OUTLINE TO FOLLOW:
${outline}

---

CRITICAL GUIDELINES:

- The writing samples above are your ground truth. When in doubt, match what you see in the samples.
- Do NOT apply every stylistic trait in every paragraph. Real writers are inconsistent — their habits appear naturally, sometimes more, sometimes less. If they overuse "however," it should appear a few times, not in every paragraph.
- If they make errors in their samples (comma splices, run-ons, informal language), include similar errors. Do NOT write a flawless essay for a flawed writer. Match their actual error rate from the samples.
- Match their paragraph length from the samples. If their paragraphs are typically 4-6 sentences with variation, write 4-6 sentence paragraphs with variation. Do not write uniform single-sentence paragraphs.
- Match their vocabulary level exactly. If they use simple, direct words in their samples, do not reach for impressive synonyms or academic phrasing.
- The essay should earn a grade consistent with ${gradeRange} — not higher. A B student's essay should read like a B essay.
- Target ~${wordCount} words.

AVOID THESE AI-DETECTOR RED FLAGS:
"delve into", "it's important to note", "in today's society", "furthermore", "multifaceted", "nuanced", "pivotal", "underscores", "highlights the importance of", "it is worth noting", "plays a crucial role", "serves as a testament"

Write the essay now. Return ONLY the essay text, no commentary or headers.`;
}
```

- [ ] **Step 2: Run the writing prompt tests**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx vitest run src/__tests__/essay-generator.test.ts -t "buildLevel2WritingPrompt"`

Expected: All 8 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/essay-generator.ts
git commit -m "feat: replace rule-driven generation with sample-first writing prompt"
```

---

### Task 6: Implement buildLevel2AuditPrompt

**Files:**
- Modify: `src/lib/essay-generator.ts`

- [ ] **Step 1: Replace buildRefinementPrompt with buildLevel2AuditPrompt**

Replace the function (locate by name `buildRefinementPrompt`) with:

```typescript
export function buildLevel2AuditPrompt(
  essay: string,
  fingerprint: StyleFingerprint,
  samples: Sample[],
  selfAssessment: SelfAssessment,
): string {
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint, selfAssessment);

  return `STUDENT'S REAL WRITING — this is the reference standard:

${refSamples}

---

GENERATED ESSAY TO AUDIT:

${essay}

---

WRITER'S PROFILE (for reference):

${narrative}

---

YOUR TASK:

Read the student's real writing samples carefully. Then read the generated essay. Ask yourself: would a teacher who has read dozens of this student's essays believe they wrote this one?

Fix any passage where the answer is no. Specifically look for:

- Vocabulary that is more sophisticated than what appears in their samples
- Sentences that are more polished or complex than their typical writing
- Paragraph structures that don't match their natural patterns (if they write multi-sentence paragraphs in their samples, the essay should too)
- Missing natural errors — if they make comma splices, run-ons, or informal phrasings in their samples, the essay should include similar imperfections
- Transitions or connective phrases they never use in their samples
- AI-detector phrases: "delve into", "it's important to note", "in today's society", "furthermore", "in conclusion", "multifaceted", "nuanced", "pivotal", "underscores", "highlights the importance of", "it is worth noting", "plays a crucial role", "serves as a testament"
- Any passage that reads as "too perfect" compared to their actual writing level

IMPORTANT:
- Do NOT add polish, sophistication, or improve the essay's quality
- Do NOT remove intentional imperfections — they are there because the student writes that way
- Do NOT make the essay better. Make it more authentic.
- Preserve everything that already sounds like the student
- Return ONLY the corrected essay, no commentary`;
}
```

- [ ] **Step 2: Run the audit prompt tests**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx vitest run src/__tests__/essay-generator.test.ts -t "buildLevel2AuditPrompt"`

Expected: All 4 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/essay-generator.ts
git commit -m "feat: replace checklist refinement with forensic sample-comparison audit"
```

---

### Task 7: Update route.ts to use new prompt builders

> **Note:** This task MUST run before deleting old functions or mapHabitsToInstructions. The old function names in essay-generator.ts were replaced by Tasks 4-6, so route.ts imports need updating to match.

**Files:**
- Modify: `src/app/api/portal/generate/route.ts`

- [ ] **Step 1: Update imports (line 6-18)**

Replace:

```typescript
import {
  buildLevel1Prompt,
  buildLevel2OutlinePrompt,
  buildLevel2GenerationPrompt,
  buildRefinementPrompt,
  buildLegacyLevel1Prompt,
  normalizeFingerprint,
} from "@/lib/essay-generator";
```

With:

```typescript
import {
  buildLevel1Prompt,
  buildLevel2PlanPrompt,
  buildLevel2WritingPrompt,
  buildLevel2AuditPrompt,
  buildLegacyLevel1Prompt,
  normalizeFingerprint,
} from "@/lib/essay-generator";
```

- [ ] **Step 2: Update Pass 1 in streamLevel2Anthropic (around line 234-242)**

Replace the outline generation block:

```typescript
    // Step 1: Generate outline (non-streaming, 45s timeout)
    const outlinePrompt = buildLevel2OutlinePrompt(opts);
    const outlineMsg = await anthropic.messages.create({
      model: LEVEL2_MODEL,
      max_tokens: 1024,
      temperature: 0.4,
      system: "You are an essay planning assistant. Create structured outlines that match a student's writing patterns.",
      messages: [{ role: "user", content: outlinePrompt }],
    }, { signal: AbortSignal.timeout(45_000) });
```

With:

```typescript
    // Step 1: Structural plan (non-streaming, 45s timeout)
    const planPrompt = buildLevel2PlanPrompt(opts);
    const outlineMsg = await anthropic.messages.create({
      model: LEVEL2_MODEL,
      max_tokens: 1024,
      temperature: 0.4,
      system: "You are an essay planning assistant. Create a concise structural outline for the assignment.",
      messages: [{ role: "user", content: planPrompt }],
    }, { signal: AbortSignal.timeout(45_000) });
```

- [ ] **Step 3: Update Pass 2 in streamLevel2Anthropic (around line 250-257)**

Replace the essay generation block:

```typescript
    // Step 2: Generate essay from outline (non-streaming, 75s timeout)
    const generationPrompt = buildLevel2GenerationPrompt(opts, outline);
    const essayMsg = await anthropic.messages.create({
      model: LEVEL2_MODEL,
      max_tokens: 4096,
      temperature: 0.5,
      system: generationPrompt,
      messages: [{ role: "user", content: "Write the essay now, following the outline." }],
    }, { signal: AbortSignal.timeout(75_000) });
```

With:

```typescript
    // Step 2: Sample-first essay generation (non-streaming, 75s timeout)
    const writingPrompt = buildLevel2WritingPrompt(opts, outline);
    const essayMsg = await anthropic.messages.create({
      model: LEVEL2_MODEL,
      max_tokens: 4096,
      temperature: 0.6,
      system: "You are ghostwriting an essay as a specific student. Your only goal is to produce writing that is indistinguishable from their own. Study their writing samples carefully — they are your primary guide. Write exactly as they would. Not better. Not worse.",
      messages: [{ role: "user", content: writingPrompt }],
    }, { signal: AbortSignal.timeout(75_000) });
```

- [ ] **Step 4: Update Pass 3 in streamLevel2Anthropic (around line 281-298)**

Replace the refinement block:

```typescript
  // Step 3: Refinement pass — compare against fingerprint + samples, fix voice mismatches
  const refinementPrompt = buildRefinementPrompt(
    rawEssay,
    opts.fingerprint,
    opts.samples,
    opts.selfAssessment,
  );
```

With:

```typescript
  // Step 3: Forensic audit — compare against student's real samples, fix voice mismatches
  const auditPrompt = buildLevel2AuditPrompt(
    rawEssay,
    opts.fingerprint,
    opts.samples,
    opts.selfAssessment,
  );
```

And update the stream creation (around line 292-298):

Replace:

```typescript
        const messageStream = anthropic.messages.stream({
          model: LEVEL2_MODEL,
          max_tokens: 4096,
          temperature: 0.3,
          system: "You are a quality control editor specializing in voice matching. Fix deviations from the student's real writing voice. Do not add polish or sophistication. Return only the corrected essay.",
          messages: [{ role: "user", content: refinementPrompt }],
        }, { signal: AbortSignal.timeout(55_000) });
```

With:

```typescript
        const messageStream = anthropic.messages.stream({
          model: LEVEL2_MODEL,
          max_tokens: 4096,
          temperature: 0.3,
          system: "You are a writing forensics expert. Your job is to compare a generated essay against a student's real writing samples and determine if it sounds like the same person wrote both. Fix anything that doesn't match.",
          messages: [{ role: "user", content: auditPrompt }],
        }, { signal: AbortSignal.timeout(55_000) });
```

- [ ] **Step 5: Remove unused import for buildLevel2OutlinePrompt and buildLevel2GenerationPrompt**

The old function names were already replaced in Step 1. Verify no references remain:

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && grep -rn "buildLevel2Outline\|buildLevel2Generation\|buildRefinement\|mapHabitsToInstructions" src/`

Expected: No matches (all references replaced)

- [ ] **Step 6: Run TypeScript check**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx tsc --noEmit`

Expected: No errors

- [ ] **Step 7: Run all tests**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx vitest run`

Expected: All tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/app/api/portal/generate/route.ts
git commit -m "feat: wire up sample-first pipeline in Level 2 generation route"
```

---

### Task 8: Delete mapHabitsToInstructions

**Files:**
- Modify: `src/lib/essay-generator.ts`

- [ ] **Step 1: Delete the mapHabitsToInstructions function**

Remove the entire function (locate by name `mapHabitsToInstructions`). It is no longer called by any code — the old `buildLevel2GenerationPrompt` that used it was replaced in Task 5.

```typescript
// DELETE THIS ENTIRE FUNCTION:
function mapHabitsToInstructions(habits: string[], other: string): string {
  const map: Record<string, string> = {
    // ... all mappings ...
  };
  // ... function body ...
}
```

- [ ] **Step 2: Run all tests**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx vitest run`

Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/essay-generator.ts
git commit -m "refactor: remove mapHabitsToInstructions (habits are now context, not instructions)"
```

---

### Task 9: Build verification

**Files:** None (verification only)

- [ ] **Step 1: Run full build**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx next build`

Expected: Build succeeds with no errors

- [ ] **Step 2: Run all tests one final time**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && npx vitest run`

Expected: All tests PASS

- [ ] **Step 3: Verify no old function names remain**

Run: `cd /Users/kingtom91/Documents/Projects/Paideia && grep -rn "buildLevel2OutlinePrompt\|buildLevel2GenerationPrompt\|buildRefinementPrompt\|mapHabitsToInstructions" src/`

Expected: No matches

- [ ] **Step 4: Verify the dev server starts and Level 2 generation works**

Run: Start the dev server if not running (`npm run dev`), navigate to a portal class, and generate a Level 2 essay. Verify:
1. The 3-pass pipeline completes without errors
2. The generated essay has multi-sentence paragraphs (not single-sentence)
3. The essay includes natural errors if the student's samples have them
4. Stylistic traits appear inconsistently, not in every paragraph
