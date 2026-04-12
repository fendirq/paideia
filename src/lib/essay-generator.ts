// ─── Types ───

export interface StyleFingerprint {
  sentencePatterns: {
    averageLength: number;
    variation: "low" | "medium" | "high";
    tendency: string;
  };
  vocabulary: {
    tier: "basic" | "moderate" | "advanced" | "inconsistent";
    signatureWords: string[];
    avoidedWords: string[];
    wordChoicePattern: string;
  };
  transitions: {
    favorites: string[];
    neverUses: string[];
    paragraphOpeners: string[];
  };
  structure: {
    introPattern: string;
    bodyParagraphPattern: string;
    conclusionPattern: string;
    avgParagraphLength: number;
    thesisPlacement: string;
  };
  evidenceStyle: {
    method: string;
    citationHabits: string;
    analysisDepth: "surface" | "moderate" | "deep";
    analysisPattern: string;
  };
  errors: {
    grammarPatterns: string[];
    punctuationHabits: string[];
    spellingTendency: string;
  };
  voice: {
    formality: "informal" | "mixed" | "formal";
    perspective: "first-person" | "third-person" | "mixed";
    contractions: boolean;
    toneDescription: string;
    distinctiveTraits: string[];
  };
  rhetoric: {
    argumentStyle: "builds-gradually" | "states-then-defends" | "comparison-based" | "narrative";
    counterArguments: "ignores" | "brief-mention" | "addresses-directly";
    hedgingLanguage: string[];
    assertiveness: "tentative" | "moderate" | "confident";
  };
  rhythm: {
    sentenceOpeners: string[];
    paragraphRhythm: "uniform" | "builds-long" | "starts-long-ends-short" | "varied";
    listUsage: "never" | "occasionally" | "frequently";
  };
  overallAssessment: string;
}

export interface TeacherProfile {
  gradeLevel: string;
  gradeOther: string;
  losesPointsFor: string[];
  losesPointsOther: string;
}

export interface SelfAssessment {
  gradeRange: string;
  gradeRangeOther: string;
  revisionLevel: string;
  revisionOther: string;
  evidenceApproach: string;
  evidenceOther: string;
  conclusionApproach: string;
  conclusionOther: string;
  wordCountTendency: string;
  wordCountOther: string;
  writingHabits: string[];
  writingHabitsOther: string;
  // Level 2 enhanced (optional)
  quoteIntroStyle?: string[];
  quoteIntroOther?: string;
  overusedPhrases?: string[];
  overusedPhrasesOther?: string;
  selfEditFocus?: string[];
  selfEditOther?: string;
  timeSpentOn?: string;
  timeSpentOther?: string;
}

interface Sample {
  label: string;
  content: string;
}

// Old interfaces for backward compat
interface LegacyWritingProfile {
  teacherProfile: {
    gradeLevel: string;
    strictness: string[];
    focusAreas: string[];
    notes: string;
  };
  selfAssessment: {
    writingStrength: string;
    writingWeakness: string;
    gradeRange: string;
    effortLevel: string;
  };
  writingStyle: {
    toneTraits: string[];
    sentenceStyle: string[];
    vocabularyLevel: string;
    commonPhrases: string;
    quirks: string;
  };
}

export interface GenerateOptions {
  teacherProfile: TeacherProfile;
  selfAssessment: SelfAssessment;
  fingerprint: StyleFingerprint;
  samples: Sample[];
  assignment: string;
  wordCount: number;
  requirements?: string;
  sourceContext?: string;
}

export interface LegacyGenerateOptions {
  profile: LegacyWritingProfile;
  samples: Sample[];
  assignment: string;
  wordCount: number;
  requirements?: string;
  sourceContext?: string;
}

// ─── Style Analysis (run at save time) ───

export function buildStyleAnalysisPrompt(samples: Sample[]): string {
  const sampleTexts = samples
    .map((s, i) => `--- Sample ${i + 1}: ${s.label} ---\n${s.content}`)
    .join("\n\n");

  return `Analyze these writing samples from a student. Extract a comprehensive style fingerprint. Be EXTREMELY specific — every claim must cite specific words, phrases, or patterns directly from the text. Do not generalize or infer patterns that aren't clearly demonstrated.

${sampleTexts}

EXTRACTION RULES:
- For vocabulary.signatureWords: include at least 10-15 words they use repeatedly across samples
- For vocabulary.avoidedWords: list sophisticated words common in academic writing that this student NEVER uses
- For transitions.favorites: list EVERY transition phrase found in the samples, not just common ones
- For rhetoric.hedgingLanguage: list EVERY hedging/qualifying phrase found in the samples verbatim (e.g., "I think", "it seems like", "maybe", "kind of")
- For rhythm.sentenceOpeners: list the 6-8 most common sentence-starting patterns, cited directly from text (e.g., "The…", "This shows…", "In the text…")
- For errors: only list patterns that appear more than once — single typos are not patterns

Return JSON with this exact structure:
{
  "sentencePatterns": {
    "averageLength": <number of words>,
    "variation": "low" | "medium" | "high",
    "tendency": "<e.g., favors compound sentences joined by 'and'>"
  },
  "vocabulary": {
    "tier": "basic" | "moderate" | "advanced" | "inconsistent",
    "signatureWords": ["<10-15 words they use often, cited from text>"],
    "avoidedWords": ["<sophisticated words they never use>"],
    "wordChoicePattern": "<e.g., uses simple verbs, rarely uses adverbs>"
  },
  "transitions": {
    "favorites": ["<every transition phrase found in samples>"],
    "neverUses": ["<common transitions absent from their writing>"],
    "paragraphOpeners": ["<how they typically start paragraphs>"]
  },
  "structure": {
    "introPattern": "<how they open essays>",
    "bodyParagraphPattern": "<typical body structure>",
    "conclusionPattern": "<how they close>",
    "avgParagraphLength": <number of sentences>,
    "thesisPlacement": "<where thesis appears>"
  },
  "evidenceStyle": {
    "method": "<quote-dump | paraphrase | embedded | minimal>",
    "citationHabits": "<how they cite>",
    "analysisDepth": "surface" | "moderate" | "deep",
    "analysisPattern": "<e.g., states the quote then explains in 1 sentence>"
  },
  "errors": {
    "grammarPatterns": ["<specific recurring errors>"],
    "punctuationHabits": ["<e.g., comma splices, avoids semicolons>"],
    "spellingTendency": "<description>"
  },
  "voice": {
    "formality": "informal" | "mixed" | "formal",
    "perspective": "first-person" | "third-person" | "mixed",
    "contractions": <boolean>,
    "toneDescription": "<1-2 sentences>",
    "distinctiveTraits": ["<what makes this writer recognizable>"]
  },
  "rhetoric": {
    "argumentStyle": "builds-gradually" | "states-then-defends" | "comparison-based" | "narrative",
    "counterArguments": "ignores" | "brief-mention" | "addresses-directly",
    "hedgingLanguage": ["<every hedging/qualifying phrase from samples verbatim>"],
    "assertiveness": "tentative" | "moderate" | "confident"
  },
  "rhythm": {
    "sentenceOpeners": ["<6-8 most common sentence-starting patterns, cited from text>"],
    "paragraphRhythm": "uniform" | "builds-long" | "starts-long-ends-short" | "varied",
    "listUsage": "never" | "occasionally" | "frequently"
  },
  "overallAssessment": "<2-3 sentence summary of this writer's identity>"
}

Return ONLY the JSON, no commentary or markdown fencing.`;
}

// ─── Helpers ───

function resolveValue(val: string, other: string): string {
  if (val === "__other__") return other;
  return val;
}

function formatList(items: string[], other?: string): string {
  const all = [...items, ...(other ? [other] : [])].filter(Boolean);
  return all.length ? all.join(", ") : "None specified";
}

function excerptSampleContent(content: string, maxChars = 3200): string {
  const normalized = content.trim().replace(/\r\n/g, "\n");
  if (normalized.length <= maxChars) return normalized;

  const headChars = Math.floor(maxChars * 0.65);
  const tailChars = maxChars - headChars - 12;
  return `${normalized.slice(0, headChars).trimEnd()}\n\n[...]\n\n${normalized.slice(-tailChars).trimStart()}`;
}

function selectDiverseSamples(samples: Sample[], maxChars = 12000): string {
  if (!samples.length) return "";

  const normalizedSamples = samples.map((sample) => ({
    ...sample,
    excerpt: excerptSampleContent(sample.content),
    length: sample.content.length,
  }));
  const sorted = [...normalizedSamples].sort((a, b) => a.length - b.length);
  const chosen = new Set<number>();

  if (sorted.length > 0) chosen.add(0);
  if (sorted.length > 1) chosen.add(sorted.length - 1);
  if (sorted.length > 2) chosen.add(Math.floor(sorted.length / 2));

  while (chosen.size < sorted.length) {
    let bestIdx = -1;
    let bestDistance = -1;

    for (let i = 0; i < sorted.length; i++) {
      if (chosen.has(i)) continue;
      const distance = Array.from(chosen).reduce((min, idx) => {
        return Math.min(min, Math.abs(sorted[i].length - sorted[idx].length));
      }, Number.POSITIVE_INFINITY);

      if (distance > bestDistance) {
        bestDistance = distance;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) break;
    chosen.add(bestIdx);
  }

  const candidates = Array.from(chosen)
    .sort((a, b) => sorted[a].length - sorted[b].length)
    .map((idx) => sorted[idx]);

  const kept: Sample[] = [];
  let total = 0;
  for (const sample of candidates) {
    const excerptLength = sample.excerpt.length;
    if (kept.length === 0 || total + excerptLength <= maxChars) {
      kept.push({ label: sample.label, content: sample.excerpt });
      total += excerptLength;
    }
  }

  return kept
    .map((s, i) => `--- Reference ${i + 1}: ${s.label} ---\n${s.content}`)
    .join("\n\n");
}

export function sanitizeEssayOutput(text: string): string {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/^```(?:\w+)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (!normalized) return "";

  const lines = normalized.split("\n");
  const cleanedLines = [...lines];

  const leadingMetaPatterns = [
    /^#{1,6}\s*(final|revised|generated)?\s*essay\b[:\- ]*$/i,
    /^(final|revised|generated)?\s*essay\b[:\- ]*$/i,
    /^here(?:'s| is)\s+(?:the\s+)?(?:final\s+|revised\s+|generated\s+)?essay[:\- ]*$/i,
    /^certainly[.!]?\s*(?:here(?:'s| is)\s+(?:the\s+)?essay[:\- ]*)?$/i,
    /^below is\s+(?:the\s+)?(?:final\s+|revised\s+|generated\s+)?essay[:\- ]*$/i,
  ];

  while (cleanedLines.length > 0) {
    const line = cleanedLines[0].trim();
    if (!line) {
      cleanedLines.shift();
      continue;
    }
    if (leadingMetaPatterns.some((pattern) => pattern.test(line))) {
      cleanedLines.shift();
      continue;
    }
    break;
  }

  const trailingMetaPatterns = [
    /^word count\s*:\s*\d+\s*$/i,
    /^let me know if you'd like/i,
    /^let me know if you want/i,
    /^i can revise/i,
    /^i can also revise/i,
    /^hope this helps[.!]*$/i,
  ];

  while (cleanedLines.length > 0) {
    const line = cleanedLines[cleanedLines.length - 1].trim();
    if (!line) {
      cleanedLines.pop();
      continue;
    }
    if (trailingMetaPatterns.some((pattern) => pattern.test(line))) {
      cleanedLines.pop();
      continue;
    }
    break;
  }

  return cleanedLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeFingerprint(raw: Record<string, unknown>): StyleFingerprint {
  const f = raw as Partial<StyleFingerprint>;
  return {
    sentencePatterns: {
      averageLength: f.sentencePatterns?.averageLength ?? 15,
      variation: f.sentencePatterns?.variation ?? "medium",
      tendency: f.sentencePatterns?.tendency ?? "",
    },
    vocabulary: {
      tier: f.vocabulary?.tier ?? "moderate",
      signatureWords: f.vocabulary?.signatureWords ?? [],
      avoidedWords: f.vocabulary?.avoidedWords ?? [],
      wordChoicePattern: f.vocabulary?.wordChoicePattern ?? "",
    },
    transitions: {
      favorites: f.transitions?.favorites ?? [],
      neverUses: f.transitions?.neverUses ?? [],
      paragraphOpeners: f.transitions?.paragraphOpeners ?? [],
    },
    structure: {
      introPattern: f.structure?.introPattern ?? "",
      bodyParagraphPattern: f.structure?.bodyParagraphPattern ?? "",
      conclusionPattern: f.structure?.conclusionPattern ?? "",
      avgParagraphLength: f.structure?.avgParagraphLength ?? 5,
      thesisPlacement: f.structure?.thesisPlacement ?? "",
    },
    evidenceStyle: {
      method: f.evidenceStyle?.method ?? "",
      citationHabits: f.evidenceStyle?.citationHabits ?? "",
      analysisDepth: f.evidenceStyle?.analysisDepth ?? "moderate",
      analysisPattern: f.evidenceStyle?.analysisPattern ?? "",
    },
    errors: {
      grammarPatterns: f.errors?.grammarPatterns ?? [],
      punctuationHabits: f.errors?.punctuationHabits ?? [],
      spellingTendency: f.errors?.spellingTendency ?? "",
    },
    voice: {
      formality: f.voice?.formality ?? "mixed",
      perspective: f.voice?.perspective ?? "mixed",
      contractions: f.voice?.contractions ?? true,
      toneDescription: f.voice?.toneDescription ?? "",
      distinctiveTraits: f.voice?.distinctiveTraits ?? [],
    },
    rhetoric: {
      argumentStyle: f.rhetoric?.argumentStyle ?? "builds-gradually",
      counterArguments: f.rhetoric?.counterArguments ?? "ignores",
      hedgingLanguage: f.rhetoric?.hedgingLanguage ?? [],
      assertiveness: f.rhetoric?.assertiveness ?? "moderate",
    },
    rhythm: {
      sentenceOpeners: f.rhythm?.sentenceOpeners ?? [],
      paragraphRhythm: f.rhythm?.paragraphRhythm ?? "varied",
      listUsage: f.rhythm?.listUsage ?? "occasionally",
    },
    overallAssessment: f.overallAssessment ?? "",
  };
}

// ─── Fingerprint Narrative Formatter ───

export function formatFingerprintNarrative(
  fp: StyleFingerprint,
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

// ─── Level 1 Prompt (fingerprint-first, uses base 8 questions) ───

export function buildLevel1Prompt(opts: GenerateOptions): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, samples, assignment, wordCount, requirements, sourceContext } = opts;

  // Include 2 shortest samples as inline reference
  const sortedSamples = [...samples].sort((a, b) => a.content.length - b.content.length);
  const refSamples = sortedSamples.slice(0, 2)
    .map((s, i) => `--- Reference ${i + 1}: ${s.label} ---\n${s.content}`)
    .join("\n\n");

  const gradeLevel = resolveValue(tp.gradeLevel, tp.gradeOther);
  const gradeRange = resolveValue(sa.gradeRange, sa.gradeRangeOther);
  const revision = resolveValue(sa.revisionLevel, sa.revisionOther);
  const evidence = resolveValue(sa.evidenceApproach, sa.evidenceOther);
  const conclusion = resolveValue(sa.conclusionApproach, sa.conclusionOther);
  const wordCountTendency = resolveValue(sa.wordCountTendency, sa.wordCountOther);
  const losesPoints = formatList(tp.losesPointsFor, tp.losesPointsOther);
  const habits = formatList(sa.writingHabits, sa.writingHabitsOther);

  return `You are replicating a specific student's writing voice. You have their analyzed style fingerprint and reference samples below. Your job is NOT to write a good essay — it's to write an essay this student would actually produce.

## Style Fingerprint (extracted from their real writing)
${JSON.stringify(fingerprint, null, 2)}

## Reference Samples (read these to internalize their voice)
${refSamples}

## Student Context
- Grade level: ${gradeLevel}, typically earns ${gradeRange}
- Revision habit: ${revision}
- Evidence approach: ${evidence}
- Conclusion approach: ${conclusion}
- Word count tendency: ${wordCountTendency}

## Known Weaknesses (DO NOT make these mistakes worse, but DO reflect their natural pattern)
${losesPoints}

## Writing Habits (MUST include these patterns naturally)
${habits}

## Assignment
${assignment}
${requirements ? `\nRubric/Requirements:\n${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

## Critical Rules
0. If approved source material is provided, you MUST use it concretely. Do not rely on vague placeholders like "in class we learned" when you can name the actual example.
1. VOCABULARY: Use words from the "signatureWords" list. NEVER use words from "avoidedWords". Stay within their vocabulary tier (${fingerprint.vocabulary.tier}).
2. SENTENCES: Match their average sentence length (~${fingerprint.sentencePatterns.averageLength} words). Replicate their sentence variation pattern (${fingerprint.sentencePatterns.variation}).
3. TRANSITIONS: ONLY use transitions from their "favorites" list. NEVER use transitions from their "neverUses" list.
4. STRUCTURE: Follow their intro/body/conclusion patterns from the fingerprint.
5. EVIDENCE: Use their evidence integration method: ${fingerprint.evidenceStyle.method}. Match their analysis depth: ${fingerprint.evidenceStyle.analysisDepth}. Their self-reported approach: "${evidence}".
6. CONCLUSIONS: Follow their pattern: "${conclusion}". Match fingerprint: ${fingerprint.structure.conclusionPattern}.
7. ERRORS: Include their documented grammar patterns naturally. Do NOT add errors they don't make.
8. VOICE: ${fingerprint.voice.toneDescription}. ${fingerprint.voice.contractions ? "They use contractions." : "They avoid contractions."} ${fingerprint.voice.perspective === "first-person" ? "They write in first person." : fingerprint.voice.perspective === "third-person" ? "They avoid first person." : "They mix perspectives."}
9. POLISH LEVEL: Revision style is "${revision}" — calibrate how polished the essay feels accordingly. A first-draft writer has rougher transitions and less refined analysis than a heavy reviser.
10. QUALITY CEILING: This should read like a ${gradeRange} essay, not higher.
11. TARGET: ~${wordCount} words. Student tendency: ${wordCountTendency}.

Write the essay now.`;
}

// ─── Level 2 Plan Prompt (simplified structural outline) ───

export function buildLevel2PlanPrompt(opts: GenerateOptions): string {
  const { teacherProfile: tp, selfAssessment: sa, assignment, wordCount, requirements, sourceContext } = opts;

  const gradeLevel = resolveValue(tp.gradeLevel, tp.gradeOther);
  const gradeRange = resolveValue(sa.gradeRange, sa.gradeRangeOther);
  const evidence = resolveValue(sa.evidenceApproach, sa.evidenceOther);
  const conclusion = resolveValue(sa.conclusionApproach, sa.conclusionOther);

  return `Create a structural outline for this essay assignment.

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

TARGET WORD COUNT: ${wordCount}

STUDENT CONTEXT:
- Grade level: ${gradeLevel}
- Typical grade: ${gradeRange}
- Evidence approach: ${evidence}
- Conclusion approach: ${conclusion}

The outline should include:
- A thesis direction (not the exact wording)
- Number of body paragraphs and what each argues
- Which evidence or quotes to use in each paragraph, prioritizing approved source material when it is provided
- A brief note on conclusion approach

Keep it structural. Do NOT include voice instructions, style notes, phrase placements, or writing tips. Structure only.`;
}

// ─── Level 2 Writing Prompt (sample-first generation) ───

export function buildLevel2WritingPrompt(opts: GenerateOptions, outline: string): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, samples, assignment, wordCount, requirements, sourceContext } = opts;

  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

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
${sourceContext ? `\n\n${sourceContext}` : ""}

OUTLINE TO FOLLOW:
${outline}

---

CRITICAL GUIDELINES — follow these in order of priority:

1. PARAGRAPH STRUCTURE (MANDATORY):
Each body paragraph MUST contain ${fingerprint.structure.avgParagraphLength} sentences (±1). Follow: "${fingerprint.structure.bodyParagraphPattern}". A ~${wordCount}-word essay should have 4-5 total paragraphs (intro + 2-3 body + conclusion), NOT 10+ short blocks. Count your sentences per paragraph before finishing.

2. SENTENCE VARIETY / BURSTINESS (MANDATORY — this is how AI detectors work):
AI detectors measure sentence-length standard deviation ("burstiness"). You MUST score above 7.0 or the essay WILL be flagged.
How to achieve this — every body paragraph must contain ALL of these:
- One SHORT sentence (4-8 words): "This matters." / "The dream fails." / "Gatsby never recovers." / "That changes everything."
- One LONG sentence (28-40 words): compound or complex, with clauses joined by commas, dashes, or conjunctions
- Several MEDIUM sentences (12-22 words) in between
Real students write in bursts: a clumsy short sentence, then a rambling long one, then something average. NEVER write 3+ consecutive sentences of similar length. If you notice a run of 15-20 word sentences, break the pattern immediately with a very short or very long one.

3. NATURAL ERRORS (MANDATORY — a flawless essay from a ${gradeRange} student is an instant AI flag):
${fingerprint.errors.grammarPatterns.length ? `- Grammar patterns to include: ${fingerprint.errors.grammarPatterns.join(", ")} (e.g., "The green light symbolizes hope, and it also shows that Gatsby..." — comma splice before "and")` : ""}
${fingerprint.errors.punctuationHabits.length ? `- Punctuation: ${fingerprint.errors.punctuationHabits.join(", ")}` : ""}
${fingerprint.errors.spellingTendency ? `- Spelling: ${fingerprint.errors.spellingTendency}` : ""}
${fingerprint.voice.contractions ? "- Contractions: They USE contractions regularly (don't, isn't, can't, doesn't, it's). An essay with zero contractions from this student is a red flag. Include 4-6 contractions spread throughout." : ""}
${fingerprint.voice.toneDescription ? `- Tone: ${fingerprint.voice.toneDescription}. Include 1-2 moments where the register slips (e.g., "which is kind of the whole point" or "Gatsby basically can't accept that...").` : ""}
Include at least 3-5 total imperfections. Scatter them naturally — don't cluster them.

4. VOCABULARY CEILING (MANDATORY):
This student's vocabulary tier is "${fingerprint.vocabulary.tier}". Their go-to words: ${fingerprint.vocabulary.signatureWords.join(", ")}.
BANNED vocabulary (too advanced for this student): "elusive", "unbridgeable", "multifaceted", "spiritually bankrupt", "pervasive", "profound", "encompasses", "transcends", "illuminates", "underscores", "epitomizes", "juxtaposition"
Instead of fancy words, use the simple ones real students use: "shows", "proves", "is about", "means that", "is important because", "represents". When in doubt, pick the simpler word.

5. EVIDENCE SPECIFICITY (MANDATORY):
Do NOT hide behind placeholders like "in class we talked about", "in the sources you can see", "history shows", or "the text says" unless you immediately name the actual evidence. Use concrete details whenever the topic allows it: people, cities, groups, policies, events, regions, dates, or direct source claims. A real student may be simple, but they still mention the actual thing they are talking about.
${sourceContext ? "If approved source material is provided, pull your evidence from it and name it directly. Do not invent source details that are not in the provided material." : ""}
If the prompt or rubric requires a minimum number of evidence pieces, actually hit that number.

6. QUALITY CEILING:
This should read like a ${gradeRange} essay. That means:
- Analysis is present but sometimes shallow or repetitive
- Some points are underdeveloped or stated without full explanation
- The conclusion may feel slightly rushed or repetitive
- Not every quote is perfectly integrated or analyzed
- Do NOT apply every stylistic trait in every paragraph — real writers are inconsistent.

7. TARGET: ~${wordCount} words.

AVOID THESE AI-DETECTOR RED FLAGS:
"delve into", "it's important to note", "in today's society", "furthermore", "multifaceted", "nuanced", "pivotal", "underscores", "highlights the importance of", "it is worth noting", "plays a crucial role", "serves as a testament", "serves as a powerful", "devastating portrait", "compelling narrative"

Write the essay now. Return ONLY the essay text, no commentary or headers.`;
}

// ─── Level 2 Critique Prompt (pass 3 — mismatch diagnosis) ───

export function buildLevel2CritiquePrompt(
  essay: string,
  fingerprint: StyleFingerprint,
  samples: Sample[],
  sourceContext?: string,
): string {
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

  return `STUDENT'S REAL WRITING — this is the ground truth:

${refSamples}

---

GENERATED ESSAY TO EVALUATE:

${essay}

---

WRITER'S PROFILE (for reference):

${narrative}

${sourceContext ? `\n---\n\n${sourceContext}` : ""}

---

YOUR TASK:

You are a ruthless writing-forensics reviewer. Compare the generated essay against the student's real samples and identify the strongest signs that the essay does NOT fully sound like them yet.

Prioritize:
- sentence rhythm / burstiness
- paragraph size and structure
- vocabulary ceiling
- evidence integration habits
- transition habits and sentence openers
- natural imperfection rate
- tone / register slips
- places where the essay sounds smarter, smoother, or more polished than the samples

RULES:
- Ground every fix in the samples or profile. Do not invent traits.
- Be specific. Quote or describe exact phrases and patterns that feel off.
- Focus on the highest-suspicion mismatches only.
- Do NOT rewrite the essay.

OUTPUT FORMAT:
VERDICT: <one sentence>

PRIORITY FIXES:
- <most important mismatch to fix first>
- <next mismatch>
- <next mismatch>
- <4-8 bullets total>

KEEP:
- <1-3 things that already sound like the student and should be preserved>

Return ONLY the critique in that format.`;
}

// ─── Level 2 Audit Prompt (pass 4 — forensic sample comparison + rewrite) ───

export function buildLevel2AuditPrompt(
  essay: string,
  fingerprint: StyleFingerprint,
  samples: Sample[],
  critiqueNotes?: string,
  sourceContext?: string,
): string {
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

  return `STUDENT'S REAL WRITING — this is the reference standard:

${refSamples}

---

GENERATED ESSAY TO AUDIT:

${essay}

---

WRITER'S PROFILE (for reference):

${narrative}

${sourceContext ? `\n---\n\n${sourceContext}` : ""}

${critiqueNotes ? `---

FORENSIC NOTES FROM A PRIOR REVIEW PASS:

${critiqueNotes}

Treat every item in PRIORITY FIXES as binding unless it directly contradicts the samples.
Preserve anything listed under KEEP if it already sounds authentic.
` : ""}

---

YOUR TASK:

Read the student's real writing samples carefully. Then read the generated essay. Ask yourself: would a teacher who has read dozens of this student's essays believe they wrote this one? Would an AI detector flag this?

Run these checks IN ORDER. The first three are the most critical — they are what AI detectors measure:

1. BURSTINESS CHECK (AI detectors measure this directly — MOST IMPORTANT CHECK):
   Count the word count of every sentence. Write the numbers down mentally. If more than 3 consecutive sentences are within 5 words of each other (e.g., 18, 20, 19, 17), you MUST break the pattern. The standard deviation of sentence lengths must be above 7.0 or the essay WILL be flagged as AI.
   Fix by:
   - ADDING 2-3 very short sentences (3-7 words) scattered across the essay: "This matters." "The dream dies here." "Nothing changes." "Gatsby fails." These are what real students write between analytical sentences.
   - COMBINING 1-2 pairs of medium sentences into single long ones (30+ words) using dashes, semicolons, or "and"/"but"
   - Every body paragraph needs at LEAST one sentence under 8 words AND one sentence over 28 words
   - If you see a paragraph where all sentences are 12-25 words, it needs surgery

2. PARAGRAPH STRUCTURE:
   Count the sentences in each body paragraph. This student writes ~${fingerprint.structure.avgParagraphLength} sentences per paragraph. If there are single-sentence paragraphs, MERGE them. The essay should have 4-6 total paragraphs, NOT 10+ tiny blocks.

3. NATURAL ERRORS — COUNT THEM:
   Count every grammar/punctuation error in the essay. This student's patterns: ${fingerprint.errors.grammarPatterns.join(", ")}; ${fingerprint.errors.punctuationHabits.join(", ")}. ${fingerprint.errors.spellingTendency || ""}
   ${fingerprint.voice.contractions ? "This student uses contractions. Count them — if fewer than 4, convert some formal phrases: \"does not\" → \"doesn't\", \"cannot\" → \"can't\", \"it is\" → \"it's\"." : ""}
   ${fingerprint.voice.toneDescription ? `Their tone: "${fingerprint.voice.toneDescription}". If the essay is uniformly formal, add 1-2 casual slips like "kind of", "basically", "a lot", or "the whole point of".` : ""}
   If the total error/imperfection count is below 3, you MUST add more until there are at least 3-5 scattered naturally throughout.

4. VOCABULARY DOWNGRADE:
   Flag every word that is more sophisticated than what appears in their samples. Their tier: "${fingerprint.vocabulary.tier}". Replace advanced words with simpler alternatives:
   "elusive" → "impossible to reach", "fundamental" → "main/basic", "pervasive" → "everywhere", "illuminates" → "shows", "transcends" → "goes beyond", "epitomizes" → "shows", "devastating" → "really bad/harsh", "comprehensive" → "full/complete"
   Use their signature words where possible: ${fingerprint.vocabulary.signatureWords.join(", ")}

5. AI-PHRASE SCAN:
   Remove: "delve into", "it's important to note", "in today's society", "furthermore", "in conclusion", "multifaceted", "nuanced", "pivotal", "underscores", "highlights the importance of", "it is worth noting", "plays a crucial role", "serves as a testament", "serves as a powerful", "devastating portrait"

6. WORD COUNT CHECK:
   If the essay feels short or underdeveloped, expand body paragraphs — add another sentence of analysis after quotes, extend a point that was stated but not explained, or add a specific example. Do NOT add new arguments or new paragraphs — just develop existing ones more fully.

7. EVIDENCE SPECIFICITY CHECK:
   Hunt for vague evidence placeholders: "in class", "in the sources", "we learned that", "history shows", "the text says". Replace them with the actual evidence whenever the topic allows it: a named person, group, city, event, policy, source claim, or concrete example. The goal is not sophistication. The goal is sounding like a real student who remembers the actual material instead of padding with generic school-language.

8. Any passage that reads as "too polished" compared to their actual writing level.

${fingerprint.voice.contractions ? `CONTRACTION ENFORCEMENT (do this last as a final pass):
Scan the entire essay for these formal phrases and convert them to contractions:
- "does not" → "doesn't"
- "do not" → "don't"
- "cannot" → "can't"
- "is not" → "isn't"
- "it is" → "it's" (when meaning "it is")
- "that is" → "that's"
- "would not" → "wouldn't"
- "they are" → "they're"
The essay should have at least 4 contractions when finished. If you can't find formal phrases to convert, rewrite 2-3 sentences to naturally include contractions (e.g., "The dream is impossible" → "The dream isn't something anyone can actually reach").` : ""}

9. TRANSITION & OPENER CHECK (count carefully):
   Go through every sentence and write down its first word. Count how many start with "The".
   RULES:
   - If more than 40% of sentences start with "The", you MUST rewrite 3-4 of them. Use: "Fitzgerald's...", "This...", "Here,...", "In the novel,...", "What emerges is..."
   - NEVER have 3+ consecutive sentences starting with the same word. If you see "The X... The Y... The Z...", rewrite the middle one.
   - Vary openers across the essay — no single word should dominate.
   ${fingerprint.transitions.favorites.length ? `This student overuses these transitions: ${fingerprint.transitions.favorites.join(", ")}. Make sure at least 2-3 of them appear in the essay — their absence is suspicious.` : ""}
   ${fingerprint.transitions.neverUses.length ? `They NEVER use: ${fingerprint.transitions.neverUses.join(", ")}. Remove any instances.` : ""}

IMPORTANT:
- Do NOT add polish, sophistication, or improve the essay's quality
- Do NOT remove intentional imperfections — they are there because the student writes that way
- Do NOT make the essay better. Make it more authentic.
- Preserve everything that already sounds like the student
- Return ONLY the corrected essay, no commentary`;
}

// ─── Level 2 Expansion Prompt (pass 5 — recover length + specificity without changing voice) ───

export function buildLevel2ExpansionPrompt(
  essay: string,
  opts: GenerateOptions,
  critiqueNotes?: string,
): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, samples, assignment, wordCount, requirements, sourceContext } = opts;
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);
  const gradeLevel = resolveValue(tp.gradeLevel, tp.gradeOther);
  const gradeRange = resolveValue(sa.gradeRange, sa.gradeRangeOther);

  return `STUDENT'S REAL WRITING — keep this voice:

${refSamples}

---

CURRENT ESSAY DRAFT:

${essay}

---

WRITER'S PROFILE:

${narrative}

---

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

${critiqueNotes ? `---

CRITIQUE NOTES TO HONOR:

${critiqueNotes}` : ""}

---

YOUR TASK:

Keep the same thesis, argument order, and overall student voice, but expand this essay so it feels like a complete ${gradeLevel} essay from a student who typically earns ${gradeRange}.

MANDATORY RULES:
- Target about ${wordCount} words. Do not stay far under.
- Expand EXISTING body paragraphs first. Do not turn this into a brand-new essay.
- Add concrete evidence instead of placeholders. Replace vague lines like "in class", "in the sources", "we learned that", or "history shows" with actual details whenever the topic allows it: named people, groups, cities, policies, events, dates, or direct source claims.
- If source material is provided, use it as the evidence pool. Name those examples directly instead of speaking in generalities.
- If the rubric asks for a minimum number of evidence pieces, make sure the draft actually reaches that threshold.
- Keep the student's natural simplicity, repetition, and imperfections. Do not suddenly sound smarter than their samples.
- Keep paragraph sizes believable for this student.
- Do not add headers, commentary, or bullet points.

GOOD EXPANSION MOVES:
- Add one more sentence of explanation after evidence that is already there
- Add a concrete historical example that supports the point already being made
- Clarify a consequence with one more specific result
- Make quotes or references less generic by naming the actual thing being referenced

BAD MOVES:
- Adding new arguments that were not already present
- Writing like a textbook or historian
- Turning the essay into polished model prose

Return ONLY the revised essay.`;
}

// ─── Post-processing: deterministic humanization ───

/**
 * Deterministic post-processing applied AFTER the LLM audit pass.
 * Injects contractions and comma splices that the model refuses to write,
 * driven by the student's fingerprint.
 */
export function humanizeEssay(essay: string, fingerprint: StyleFingerprint): string {
  let result = essay;

  // 0. Normalize curly/smart quotes to ASCII for reliable processing
  result = normalizeQuotes(result);

  // 1. Contraction injection (only if fingerprint says student uses them)
  if (fingerprint.voice.contractions) {
    result = injectContractions(result, 4, 7);
  }

  // 2. Comma splice injection (only if fingerprint lists it as an error pattern)
  const hasCommaSplices = fingerprint.errors.grammarPatterns.some(
    (p) => /comma\s*splice/i.test(p)
  );
  if (hasCommaSplices) {
    result = injectCommaSplices(result, 1, 2);
  }

  // 3. Sentence opener diversity — break runs of 3+ sentences starting with "The"
  result = diversifyOpeners(result);

  // 4. Missing comma after introductory clause (if fingerprint lists it)
  const hasMissingCommas = fingerprint.errors.grammarPatterns.some(
    (p) => /missing comma|comma after/i.test(p)
  ) || fingerprint.errors.punctuationHabits.some(
    (p) => /comma/i.test(p)
  );
  if (hasMissingCommas) {
    result = removeSomeIntroCommas(result, 1, 2);
  }

  // 5. Inject 1-2 short sentences by splitting trailing clauses off long sentences
  result = injectShortSentences(result);

  // 6. Burstiness — target 7.5–10.5 range
  result = boostBurstiness(result);

  // 7. Remove em dashes — students rarely use them, strong AI tell
  result = stripEmDashes(result);

  // 8. Clean up double-period artifacts
  result = result.replace(/\.{2,}/g, ".");

  return result;
}

/**
 * Inject 1-2 short sentences (≤8 words) by detaching trailing clauses
 * from long sentences. This breaks the AI pattern of uniformly long sentences.
 * Targets patterns like ", which shows X." → ". This shows X."
 */
function injectShortSentences(essay: string): string {
  // Track total injections across paragraphs
  let totalInjected = 0;
  const maxTotal = 2;

  const trailPatterns = [
    { re: /,\s+which (shows|proves|means|demonstrates|reveals|suggests)\b/i, replace: (v: string) => `This ${v}` },
    { re: /,\s+and this (is|shows|proves|means|matters|represents)\b/i, replace: (v: string) => `This ${v}` },
    { re: /,\s+which is (basically|kind of|really|essentially|pretty much)\b/i, replace: (v: string) => `This is ${v}` },
    { re: /,\s+making it (clear|obvious|impossible|evident)\b/i, replace: (v: string) => `This makes it ${v}` },
    { re: /,\s+leaving (them|him|her|society|everyone|the)\b/i, replace: (v: string) => `This leaves ${v}` },
  ];

  const paragraphs = essay.split(/\n{2,}/);
  const processed = paragraphs.map((paragraph) => {
    const p = paragraph.trim();
    if (!p || totalInjected >= maxTotal) return p;

    const sentences = splitSentences(p);
    if (sentences.length < 3) return p;

    const result = [...sentences];
    let injected = 0;

    const indices = sentences
      .map((s, i) => ({ i, len: s.split(/\s+/).length }))
      .filter((x) => x.len > 22)
      .sort((a, b) => b.len - a.len);

    for (const { i } of indices) {
      if (injected >= 1 || totalInjected >= maxTotal) break;
      const sent = result[i];

      for (const { re, replace } of trailPatterns) {
        const match = re.exec(sent);
        if (match && match.index > 0) {
          const beforeWords = sent.slice(0, match.index).split(/\s+/).length;
          if (beforeWords < 10) continue;

          const firstPart = sent.slice(0, match.index) + ".";
          const verb = match[1];
          const afterClause = replace(verb) + sent.slice(match.index + match[0].length);
          const shortSent = afterClause.charAt(0).toUpperCase() + afterClause.slice(1);

          if (shortSent.split(/\s+/).length <= 10) {
            result[i] = firstPart;
            result.splice(i + 1, 0, shortSent);
            injected++;
            totalInjected++;
            break;
          }
        }
      }
    }

    return result.join(" ");
  });

  return processed.filter((p) => p.length > 0).join("\n\n");
}

/**
 * Replace em dashes with student-appropriate punctuation.
 * Students rarely use em dashes — AI models love them.
 * " — " mid-sentence → ", " or ". " depending on what follows.
 */
function stripEmDashes(text: string): string {
  // " — fragment" where fragment starts lowercase → replace with comma
  // " — Fragment" where Fragment starts uppercase → replace with period + new sentence
  return text.replace(/\s*—\s*/g, (match, offset) => {
    const after = text[offset + match.length];
    if (after && after === after.toUpperCase() && after !== after.toLowerCase()) {
      // Uppercase follows — make it a new sentence
      return ". ";
    }
    // Lowercase follows — use comma
    return ", ";
  });
}

/** Normalize curly/smart quotes to ASCII so isInsideQuotes works reliably */
function normalizeQuotes(text: string): string {
  return text
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')  // curly double quotes → ASCII
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'"); // curly single quotes → ASCII
}

/** Seeded-random helper using essay length as seed for determinism */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Find formal phrases and convert a random subset to contractions.
 * Skips anything inside quotation marks (preserving cited text).
 */
function injectContractions(essay: string, min: number, max: number): string {
  const contractionMap: [RegExp, string][] = [
    [/\bdoes not\b/g, "doesn't"],
    [/\bdo not\b/g, "don't"],
    [/\bcannot\b/g, "can't"],
    [/\bcan not\b/g, "can't"],
    [/\bis not\b/g, "isn't"],
    [/\bwould not\b/g, "wouldn't"],
    [/\bcould not\b/g, "couldn't"],
    [/\bshould not\b/g, "shouldn't"],
    [/\bthey are\b/g, "they're"],
    [/\bwill not\b/g, "won't"],
    [/\bit is\b/g, "it's"],
    [/\bthat is\b/g, "that's"],
    [/\bwas not\b/g, "wasn't"],
    [/\bwere not\b/g, "weren't"],
    [/\bdid not\b/g, "didn't"],
    [/\bhas not\b/g, "hasn't"],
    [/\bhave not\b/g, "haven't"],
  ];

  // Find all candidate positions (not inside quotes)
  interface Match { index: number; length: number; replacement: string }
  const candidates: Match[] = [];

  for (const [pattern, replacement] of contractionMap) {
    let m: RegExpExecArray | null;
    const re = new RegExp(pattern.source, "gi");
    while ((m = re.exec(essay)) !== null) {
      if (!isInsideQuotes(essay, m.index)) {
        candidates.push({ index: m.index, length: m[0].length, replacement });
      }
    }
  }

  if (candidates.length === 0) return essay;

  // Sort by position descending so replacements don't shift indices
  candidates.sort((a, b) => b.index - a.index);

  const rand = seededRandom(essay.length);
  const count = Math.min(
    candidates.length,
    min + Math.floor(rand() * (max - min + 1))
  );

  // Shuffle using Fisher-Yates with seeded random, then take first `count`
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Take the selected ones, re-sort descending by index for safe replacement
  const selected = shuffled.slice(0, count).sort((a, b) => b.index - a.index);

  let result = essay;
  for (const { index, length, replacement } of selected) {
    result = result.slice(0, index) + replacement + result.slice(index + length);
  }

  return result;
}

/**
 * Convert 1-2 period-separated clauses into comma splices.
 * Targets patterns like ". This shows" or ". It also" mid-paragraph.
 */
function injectCommaSplices(essay: string, min: number, max: number): string {
  // Target common student continuation patterns after a period
  const splicePattern = /\.\s+(This shows|This proves|It also|It is|This is|It was|He also|She also|They also|The eyes|The light|The valley)/g;

  interface SpliceMatch { index: number; fullLength: number; continuation: string }
  const candidates: SpliceMatch[] = [];

  let m: RegExpExecArray | null;
  while ((m = splicePattern.exec(essay)) !== null) {
    if (!isInsideQuotes(essay, m.index)) {
      const continuation = m[1];
      candidates.push({
        index: m.index,
        fullLength: m[0].length,
        continuation: continuation.charAt(0).toLowerCase() + continuation.slice(1),
      });
    }
  }

  if (candidates.length === 0) return essay;

  const rand = seededRandom(essay.length + 7);
  const count = Math.min(
    candidates.length,
    min + Math.floor(rand() * (max - min + 1))
  );

  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, count).sort((a, b) => b.index - a.index);

  let result = essay;
  for (const { index, fullLength, continuation } of selected) {
    result = result.slice(0, index) + ", " + continuation + result.slice(index + fullLength);
  }

  return result;
}

/**
 * Split a single paragraph into sentences, handling abbreviations like T.J., Dr., Mr., St., etc.
 * Returns array of sentence strings.
 */
function splitSentences(text: string): string[] {
  // Protect common abbreviations by temporarily replacing their periods
  const PLACEHOLDER = "\x00";
  let safe = text;
  // Two-letter initials (T.J., U.S., F., etc.)
  safe = safe.replace(/\b([A-Z])\.([A-Z])\./g, `$1${PLACEHOLDER}$2${PLACEHOLDER}`);
  safe = safe.replace(/\b([A-Z])\.\s(?=[A-Z][a-z])/g, `$1${PLACEHOLDER} `);
  // Common titles and abbreviations
  safe = safe.replace(/\b(Dr|Mr|Mrs|Ms|St|Jr|Sr|Prof|etc|vs|Vol|Ch)\./gi, `$1${PLACEHOLDER}`);

  const parts = safe.split(/(?<=[.!?])\s+/);

  // Restore placeholders
  return parts.map((s) => s.replace(new RegExp(PLACEHOLDER, "g"), "."));
}

/**
 * Apply a paragraph-level function to each paragraph independently,
 * preserving paragraph break boundaries (\n\n).
 */
function perParagraph(essay: string, fn: (paragraph: string) => string): string {
  const paragraphs = essay.split(/\n{2,}/);
  return paragraphs.map((p) => p.trim()).filter((p) => p.length > 0).map(fn).join("\n\n");
}

/**
 * Break runs of 3+ consecutive sentences that start with the same word.
 * AI tends to produce "The X... The Y... The Z..." patterns that feel robotic.
 */
function diversifyOpeners(essay: string): string {
  // Process each paragraph independently to preserve paragraph breaks
  return perParagraph(essay, (paragraph) => {
    const sentences = splitSentences(paragraph);
    if (sentences.length < 3) return paragraph;

    const getOpener = (s: string) => (s.match(/^\s*(\w+)/) || ["", ""])[1].toLowerCase();

    for (let i = 0; i < sentences.length - 2; i++) {
      const a = getOpener(sentences[i]);
      const b = getOpener(sentences[i + 1]);
      const c = getOpener(sentences[i + 2]);

      if (a && a === b && b === c) {
        const sent = sentences[i + 1];
        const firstWord = (sent.match(/^\s*(\w+)/) || ["", ""])[1];
        const rest = sent.slice(firstWord.length);

        const replacements: Record<string, string[]> = {
          the: ["This", "Fitzgerald's", "Here,", "In this scene,"],
          this: ["Such", "That", "Here,", "Fitzgerald's"],
          these: ["Such", "All of these", "Together,"],
          it: ["The symbol", "This image", "What emerges"],
          he: ["Gatsby", "The character", "Fitzgerald's protagonist"],
        };

        const options = replacements[firstWord.toLowerCase()] || ["Additionally,", "Here,"];
        const pick = options[sentences.length % options.length];
        sentences[i + 1] = pick + rest;
      }
    }

    return sentences.join(" ");
  });
}

/**
 * Remove commas after 1-2 introductory clauses to simulate a common student error.
 * Targets patterns like "In the novel, " → "In the novel "
 */
function removeSomeIntroCommas(essay: string, min: number, max: number): string {
  const introPattern = /\b(In the novel|In this scene|In the text|Throughout the novel|At this point|During this time|In the end|At the beginning|By the end),\s/g;

  interface IntroMatch { index: number; fullLength: number; replacement: string }
  const candidates: IntroMatch[] = [];

  let m: RegExpExecArray | null;
  while ((m = introPattern.exec(essay)) !== null) {
    if (!isInsideQuotes(essay, m.index)) {
      candidates.push({
        index: m.index,
        fullLength: m[0].length,
        replacement: m[1] + " ", // drop the comma
      });
    }
  }

  if (candidates.length === 0) return essay;

  const rand = seededRandom(essay.length + 13);
  const count = Math.min(candidates.length, min + Math.floor(rand() * (max - min + 1)));

  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, count).sort((a, b) => b.index - a.index);

  let result = essay;
  for (const { index, fullLength, replacement } of selected) {
    result = result.slice(0, index) + replacement + result.slice(index + fullLength);
  }

  return result;
}

/**
 * Target burstiness (sentence-length stddev) in the 7.5–13.0 range.
 * Below 7.5: split long sentences + merge short pairs to increase variance.
 * Above 13.0: merge very short fragments back into neighbors to reduce extreme variance.
 */
function boostBurstiness(essay: string): string {
  // Process each paragraph independently to preserve paragraph breaks
  return perParagraph(essay, boostBurstinessParagraph);
}

function boostBurstinessParagraph(paragraph: string): string {
  let sentences = splitSentences(paragraph);
  if (sentences.length < 4) return paragraph;

  const calcStddev = (lens: number[]) => {
    const a = lens.reduce((x, y) => x + y, 0) / lens.length;
    return Math.sqrt(lens.map((l) => (l - a) ** 2).reduce((x, y) => x + y, 0) / lens.length);
  };

  let lengths = sentences.map((s) => s.split(/\s+/).length);
  let sd = calcStddev(lengths);

  // ─── Too LOW: push variance up ───
  if (sd < 7.5) {
    // Split longest sentences (>20 words) at breakpoints
    const splitTargets: { idx: number; len: number }[] = [];
    for (let i = 0; i < sentences.length; i++) {
      if (lengths[i] > 20) splitTargets.push({ idx: i, len: lengths[i] });
    }
    splitTargets.sort((a, b) => b.len - a.len);
    const toSplit = splitTargets.slice(0, 3);
    toSplit.sort((a, b) => b.idx - a.idx);

    const result = [...sentences];
    for (const { idx } of toSplit) {
      const split = splitSentenceAtBreakpoint(result[idx]);
      if (split) result.splice(idx, 1, split[0], split[1]);
    }
    sentences = result;
    lengths = sentences.map((s) => s.split(/\s+/).length);
    sd = calcStddev(lengths);

    // If still too low, merge pairs of short adjacent sentences
    if (sd < 7.5) {
      for (let i = 0; i < sentences.length - 1; i++) {
        if (lengths[i] < 14 && lengths[i + 1] < 14 && lengths[i] > 3 && lengths[i + 1] > 3) {
          const first = sentences[i].replace(/\.\s*$/, "");
          const second = sentences[i + 1];
          sentences[i] = first + ", and " + second.charAt(0).toLowerCase() + second.slice(1);
          sentences.splice(i + 1, 1);
          break;
        }
      }
    }
  }

  // ─── Too HIGH: pull variance down ───
  lengths = sentences.map((s) => s.split(/\s+/).length);
  sd = calcStddev(lengths);

  if (sd > 13.0) {
    // Merge very short fragments (≤4 words) into the previous sentence
    for (let i = sentences.length - 1; i > 0; i--) {
      if (lengths[i] <= 4 && lengths[i - 1] > 6) {
        const fragment = sentences[i].replace(/\.\s*$/, "");
        const prev = sentences[i - 1].replace(/\.\s*$/, "");
        sentences[i - 1] = prev + ", and " + fragment.charAt(0).toLowerCase() + fragment.slice(1) + ".";
        sentences.splice(i, 1);
        lengths = sentences.map((s) => s.split(/\s+/).length);
        sd = calcStddev(lengths);
        if (sd <= 13.0) break;
      }
    }
  }

  // If still too high, iteratively split the longest sentences to bring variance down
  for (let attempt = 0; attempt < 3 && sd > 10.5; attempt++) {
    lengths = sentences.map((s) => s.split(/\s+/).length);
    const maxIdx = lengths.indexOf(Math.max(...lengths));
    if (lengths[maxIdx] > 25) {
      const split = splitSentenceAtBreakpoint(sentences[maxIdx]);
      if (split) {
        sentences.splice(maxIdx, 1, split[0], split[1]);
        lengths = sentences.map((s) => s.split(/\s+/).length);
        sd = calcStddev(lengths);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return sentences.join(" ");
}

/**
 * Split a long sentence into two at a natural breakpoint.
 * Returns [shortPart, remainder] or null if no good split found.
 */
function splitSentenceAtBreakpoint(sentence: string): [string, string] | null {
  const breakPatterns = [
    /,\s+(which\s)/i,
    /,\s+(and this\s)/i,
    /,\s+(and the\s)/i,
    /,\s+(and it\s)/i,
    /,\s+(and when\s)/i,
    /,\s+(and their\s)/i,
    /,\s+(and her\s)/i,
    /,\s+(and his\s)/i,
    /,\s+(but\s)/i,
    /,\s+(however\s)/i,
    /,\s+(yet\s)/i,
    /,\s+(while\s)/i,
    /,\s+(where\s)/i,
    /,\s+(leaving\s)/i,
    /,\s+(making\s)/i,
    /,\s+(creating\s)/i,
    /,\s+(suggesting\s)/i,
    /,\s+(demonstrating\s)/i,
    /,\s+(revealing\s)/i,
    /,\s+(showing\s)/i,
    /,\s+(reflecting\s)/i,
    /,\s+(symbolizing\s)/i,
    /,\s+(indicating\s)/i,
    /,\s+(meaning\s)/i,
    /,\s+(also\s)/i,
    /,\s+(as\s)/i,
  ];

  for (const pattern of breakPatterns) {
    const match = pattern.exec(sentence);
    if (match && match.index > 0) {
      const splitPos = match.index;
      const words = sentence.slice(0, splitPos).split(/\s+/);
      // Only split if the first part has at least 6 words
      if (words.length < 6) continue;

      const firstPart = sentence.slice(0, splitPos) + ".";
      const conjunction = match[1].charAt(0).toUpperCase() + match[1].slice(1);
      const remainder = conjunction + sentence.slice(match.index + match[0].length);
      return [firstPart, remainder];
    }
  }

  return null;
}

/** Check whether position idx falls inside a quoted passage */
function isInsideQuotes(text: string, idx: number): boolean {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < idx; i++) {
    if (text[i] === '"' && !inSingle) inDouble = !inDouble;
    if (text[i] === "'" && !inDouble && i > 0 && /[a-zA-Z]/.test(text[i - 1]) === false) {
      inSingle = !inSingle;
    }
  }
  return inDouble || inSingle;
}

// ─── Legacy Prompts (fallback when no fingerprint exists) ───

export function buildLegacyLevel1Prompt(opts: LegacyGenerateOptions): string {
  const { profile, samples, assignment, wordCount, requirements, sourceContext } = opts;
  const { teacherProfile: tp, selfAssessment: sa, writingStyle: ws } = profile;

  const sampleTexts = samples
    .map((s, i) => `--- Sample ${i + 1}: ${s.label} ---\n${s.content}`)
    .join("\n\n");

  return `You are a writing replication engine. Your job is to write an essay that sounds EXACTLY like the student whose writing samples and profile are provided below. Do NOT write like an AI. Do NOT write perfectly. Match the student's actual skill level, habits, and voice.

## Student Profile
- Grade Level: ${tp.gradeLevel}
- Typical Grade Range: ${sa.gradeRange}
- Effort Level: ${sa.effortLevel}
- Biggest Strength: ${sa.writingStrength}
- Biggest Weakness: ${sa.writingWeakness}

## Teacher Expectations
- Strictness: ${tp.strictness.join(", ") || "Not specified"}
- Focus Areas: ${tp.focusAreas.join(", ") || "Not specified"}
- Notes: ${tp.notes || "None"}

## Student's Writing Style
- Tone: ${ws.toneTraits.join(", ") || "Not specified"}
- Sentence Style: ${ws.sentenceStyle.join(", ") || "Not specified"}
- Vocabulary: ${ws.vocabularyLevel || "Not specified"}
- Common Phrases: ${ws.commonPhrases || "None noted"}
- Quirks: ${ws.quirks || "None noted"}

## Writing Samples (STUDY THESE CAREFULLY — replicate this exact voice)
${sampleTexts}

## Assignment
${assignment}
${requirements ? `\nAdditional Requirements: ${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

## Instructions
Write approximately ${wordCount} words. Match the student's:
1. Vocabulary level and word choices
2. Sentence structure patterns
3. Tone and voice
4. Common phrases and transitions
5. Typical mistakes and imperfections
6. Level of analysis depth (match their grade range, not higher)

The essay must read as if the student wrote it themselves. Include their natural imperfections. Do NOT be too polished or sophisticated beyond their demonstrated ability.`;
}
