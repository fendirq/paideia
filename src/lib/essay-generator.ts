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
}

export interface LegacyGenerateOptions {
  profile: LegacyWritingProfile;
  samples: Sample[];
  assignment: string;
  wordCount: number;
  requirements?: string;
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

function selectDiverseSamples(samples: Sample[], maxChars = 12000): string {
  if (!samples.length) return "";
  const sorted = [...samples].sort((a, b) => a.content.length - b.content.length);
  const candidates: Sample[] = [sorted[0]];
  if (sorted.length > 1) candidates.push(sorted[sorted.length - 1]);
  if (sorted.length > 2) candidates.push(sorted[Math.floor(sorted.length / 2)]);
  const kept: Sample[] = [];
  let total = 0;
  for (const s of candidates) {
    if (kept.length === 0 || total + s.content.length <= maxChars) {
      kept.push(s);
      total += s.content.length;
    }
  }
  return kept
    .map((s, i) => `--- Reference ${i + 1}: ${s.label} ---\n${s.content}`)
    .join("\n\n");
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

// ─── Level 1 Prompt (fingerprint-first, uses base 8 questions) ───

export function buildLevel1Prompt(opts: GenerateOptions): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, samples, assignment, wordCount, requirements } = opts;

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

## Critical Rules
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

// ─── Level 2 Outline Prompt (uses all 12 fields) ───

export function buildLevel2OutlinePrompt(opts: GenerateOptions): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, assignment, wordCount, requirements } = opts;

  const gradeLevel = resolveValue(tp.gradeLevel, tp.gradeOther);
  const gradeRange = resolveValue(sa.gradeRange, sa.gradeRangeOther);
  const evidence = resolveValue(sa.evidenceApproach, sa.evidenceOther);
  const conclusion = resolveValue(sa.conclusionApproach, sa.conclusionOther);
  const timeSpent = resolveValue(sa.timeSpentOn ?? "", sa.timeSpentOther ?? "");
  const losesPoints = formatList(tp.losesPointsFor, tp.losesPointsOther);
  const quoteIntros = formatList(sa.quoteIntroStyle ?? [], sa.quoteIntroOther);
  const overused = formatList(sa.overusedPhrases ?? [], sa.overusedPhrasesOther);
  const selfEdit = formatList(sa.selfEditFocus ?? [], sa.selfEditOther);

  return `Create a detailed outline for an essay that matches this student's writing patterns. Plan voice markers INTO the outline — don't leave voice for later.

## Assignment
${assignment}
${requirements ? `\nRubric/Requirements:\n${requirements}` : ""}

## Student's Structural Patterns (from fingerprint)
- Intro pattern: ${fingerprint.structure.introPattern}
- Body paragraph pattern: ${fingerprint.structure.bodyParagraphPattern}
- Conclusion pattern: ${fingerprint.structure.conclusionPattern}
- Avg paragraph length: ${fingerprint.structure.avgParagraphLength} sentences
- Thesis placement: ${fingerprint.structure.thesisPlacement}
- Evidence method: ${fingerprint.evidenceStyle.method}
- Analysis depth: ${fingerprint.evidenceStyle.analysisDepth}
- Argument style: ${fingerprint.rhetoric.argumentStyle}
- Counter-arguments: ${fingerprint.rhetoric.counterArguments}

## Student's Self-Reported Patterns
- Evidence approach: ${evidence}
- Conclusion approach: ${conclusion}
- Weaknesses to avoid: ${losesPoints}
${timeSpent ? `- They spend the most time on: ${timeSpent} — that section gets the most polish` : ""}

## Voice Placement Plan (embed these into the outline)
- Plan where to use their quote intro patterns: ${quoteIntros}
- Plan where to deploy their overused phrases (at least 2-3 times): ${overused}
- Plan which hedging phrases to use in which paragraphs: ${fingerprint.rhetoric.hedgingLanguage.join(", ")}
- Plan sentence openers for each paragraph from: ${fingerprint.rhythm.sentenceOpeners.join(", ")}
${timeSpent ? `- Plan the polish gradient: "${timeSpent}" gets the most polish; other sections stay rougher` : ""}
- Plan which known errors will appear where (they fix ${selfEdit} during self-editing — let other error types survive)

## Quality Target
Grade level: ${gradeLevel}, typical grade: ${gradeRange}
Target: ~${wordCount} words

Return a structured outline with:
1. A thesis statement that matches their voice and assertiveness level (${fingerprint.rhetoric.assertiveness})
2. Paragraph-by-paragraph plan: topic sentence idea, evidence to include, analysis approach, AND which voice markers go where
3. Follow their typical structure — do NOT impose a structure they don't naturally use
4. Note which sections should feel more polished vs rougher

Return ONLY the outline, no commentary.`;
}

// ─── Level 2 Generation Prompt (uses outline + all 12 fields) ───

export function buildLevel2GenerationPrompt(opts: GenerateOptions, outline: string): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, samples, assignment, wordCount, requirements } = opts;

  const refSamples = selectDiverseSamples(samples);

  const gradeLevel = resolveValue(tp.gradeLevel, tp.gradeOther);
  const gradeRange = resolveValue(sa.gradeRange, sa.gradeRangeOther);
  const revision = resolveValue(sa.revisionLevel, sa.revisionOther);
  const evidence = resolveValue(sa.evidenceApproach, sa.evidenceOther);
  const conclusion = resolveValue(sa.conclusionApproach, sa.conclusionOther);
  const wordCountTendency = resolveValue(sa.wordCountTendency, sa.wordCountOther);
  const losesPoints = formatList(tp.losesPointsFor, tp.losesPointsOther);
  const habits = sa.writingHabits ?? [];
  const habitsOther = sa.writingHabitsOther ?? "";

  // Level 2 enhanced fields
  const quoteIntros = formatList(sa.quoteIntroStyle ?? [], sa.quoteIntroOther);
  const overused = formatList(sa.overusedPhrases ?? [], sa.overusedPhrasesOther);
  const selfEdit = formatList(sa.selfEditFocus ?? [], sa.selfEditOther);
  const timeSpent = resolveValue(sa.timeSpentOn ?? "", sa.timeSpentOther ?? "");

  // Map each writing habit checkbox to a concrete instruction
  const habitInstructions = mapHabitsToInstructions(habits, habitsOther);

  return `You are replicating a specific student's writing voice with extreme precision. Follow the outline below exactly. Every rule in the VOICE ENFORCEMENT section is mandatory — violating any one means the essay fails to match.

## Outline (follow this structure)
${outline}

## Style Fingerprint
${JSON.stringify(fingerprint, null, 2)}

## Reference Samples (read these to internalize their voice — this is what they ACTUALLY sound like)
${refSamples}

## Assignment
${assignment}
${requirements ? `\nRubric/Requirements:\n${requirements}` : ""}

## VOICE ENFORCEMENT — Each rule is mandatory

FROM FINGERPRINT:
1. VOCABULARY: Use ONLY words in tier "${fingerprint.vocabulary.tier}". Include these signature words at least once each: ${fingerprint.vocabulary.signatureWords.slice(0, 8).join(", ")}. NEVER use: ${fingerprint.vocabulary.avoidedWords.join(", ")}.
2. SENTENCES: Average ${fingerprint.sentencePatterns.averageLength} words. Tendency: "${fingerprint.sentencePatterns.tendency}". Vary sentences ${fingerprint.sentencePatterns.variation}.
3. TRANSITIONS: ALLOWED: ${fingerprint.transitions.favorites.join(", ")}. BANNED: ${fingerprint.transitions.neverUses.join(", ")}. Use paragraph openers from: ${fingerprint.transitions.paragraphOpeners.join(", ")}.
4. STRUCTURE: Intro: "${fingerprint.structure.introPattern}". Body: "${fingerprint.structure.bodyParagraphPattern}". Conclusion: "${fingerprint.structure.conclusionPattern}". Paragraphs avg ${fingerprint.structure.avgParagraphLength} sentences.
5. EVIDENCE: Method: ${fingerprint.evidenceStyle.method}. After quoting: "${fingerprint.evidenceStyle.analysisPattern}". Depth: ${fingerprint.evidenceStyle.analysisDepth}.
6. ERRORS: Reproduce these grammar patterns: ${fingerprint.errors.grammarPatterns.join(", ")}. Punctuation habits: ${fingerprint.errors.punctuationHabits.join(", ")}. These feel natural to this student.
7. VOICE: ${fingerprint.voice.toneDescription}. Contractions: ${fingerprint.voice.contractions ? "yes" : "no"}. Perspective: ${fingerprint.voice.perspective}. Distinctive: ${fingerprint.voice.distinctiveTraits.join(", ")}.
8. RHETORIC: Argues by ${fingerprint.rhetoric.argumentStyle}. Counter-arguments: ${fingerprint.rhetoric.counterArguments}. Uses hedging: ${fingerprint.rhetoric.hedgingLanguage.join(", ")} — include at least 3 of these.
9. RHYTHM: Starts sentences with: ${fingerprint.rhythm.sentenceOpeners.join(", ")} — use at least 5 of these. Paragraph rhythm: ${fingerprint.rhythm.paragraphRhythm}.

FROM QUESTIONNAIRE:
10. GRADE CEILING: This is a ${gradeRange} essay from a ${gradeLevel} student. Do NOT exceed this quality level.
11. REVISION FEEL: Student's revision style is "${revision}". ${revision === "I submit my first draft as-is" ? "Essay should feel unpolished: rough transitions, occasional incomplete thoughts, uneven paragraph lengths." : revision === "I reread and fix obvious errors" ? "Essay should be mostly clean but with occasional awkward phrasing and underdeveloped analysis." : "Essay should feel more polished but still at their grade level."}
12. WEAKNESSES: Student loses points for: ${losesPoints}. Include subtle traces of these weaknesses — the teacher expects to see them.
${habitInstructions ? `13. WRITING HABITS:\n${habitInstructions}` : ""}
14. WORD COUNT: Target ~${wordCount} words. Student ${wordCountTendency}.

FROM LEVEL 2 ENHANCED:
15. QUOTE PATTERNS: When introducing any quote, use ONLY these phrasings: ${quoteIntros}. Never use any other quote introduction pattern. This is a critical voice marker.
16. OVERUSED PHRASES: Include these phrases: ${overused}. Place them where a student naturally would — in topic sentences, transitions, and analysis sentences. Include at least 3 across the essay.
17. ERROR SURVIVAL: Student self-edits for: ${selfEdit}. This means those error types are FIXED in their writing. But errors OUTSIDE that list survive. Let non-self-edited error types persist naturally.
${timeSpent ? `18. POLISH GRADIENT: Student spends the most effort on "${timeSpent}". That section should be noticeably more polished. Other sections should feel comparatively rougher — less refined transitions, simpler analysis, less careful word choice.` : ""}

Write the essay now, following the outline.`;
}

// ─── Level 2 Refinement Prompt (pass 3 — self-correction) ───

export function buildRefinementPrompt(
  essay: string,
  fingerprint: StyleFingerprint,
  samples: Sample[],
  selfAssessment: SelfAssessment,
): string {
  const refSamples = selectDiverseSamples(samples);

  const revision = resolveValue(selfAssessment.revisionLevel, selfAssessment.revisionOther);
  const gradeRange = resolveValue(selfAssessment.gradeRange, selfAssessment.gradeRangeOther);
  const quoteIntros = formatList(selfAssessment.quoteIntroStyle ?? [], selfAssessment.quoteIntroOther);
  const overused = formatList(selfAssessment.overusedPhrases ?? [], selfAssessment.overusedPhrasesOther);

  return `You are a quality control editor. Compare this essay against the student's actual writing samples and style fingerprint. Your job is to find any places where the essay sounds like AI or deviates from the student's real voice, and fix them.

## Generated Essay
${essay}

## Style Fingerprint
${JSON.stringify(fingerprint, null, 2)}

## Student's Actual Writing (compare against these)
${refSamples}

## Checklist — verify each one:
- Vocabulary stays within ${fingerprint.vocabulary.tier} tier. No words from avoidedWords list: ${fingerprint.vocabulary.avoidedWords.join(", ")}
- Transitions are ONLY from favorites list: ${fingerprint.transitions.favorites.join(", ")}
- Sentence length averages ~${fingerprint.sentencePatterns.averageLength} words with ${fingerprint.sentencePatterns.variation} variation
- Quote introductions use ONLY: ${quoteIntros}
- Overused phrases appear 2-3 times: ${overused}
- Hedging language present: ${fingerprint.rhetoric.hedgingLanguage.join(", ")}
- Sentence openers match: ${fingerprint.rhythm.sentenceOpeners.join(", ")}
- "${revision}" revision feel — polish level matches
- Quality ceiling: reads like a ${gradeRange} essay, not higher
- No AI-sounding phrases ("delve into", "it's important to note", "in today's society", "furthermore", "in conclusion", "multifaceted", "nuanced", "pivotal", "underscores", "highlights the importance")

Rewrite the essay fixing ONLY the deviations. Preserve everything that already matches. Do not add polish, sophistication, or improve quality — only fix voice mismatches. Return ONLY the corrected essay, no commentary.`;
}

function mapHabitsToInstructions(habits: string[], other: string): string {
  const map: Record<string, string> = {
    "I start essays with a question or hook quote": "Start the introduction with a question or hook quote.",
    "I overuse certain transition words": "Use transition favorites with higher frequency than normal.",
    "My introductions tend to be long/wordy": "Make the introduction 30%+ longer than body paragraphs.",
    "I write in first person even when I probably shouldn't": "Use first person throughout, even in analytical sections.",
    "I use rhetorical questions a lot": "Include at least 2 rhetorical questions in body paragraphs.",
    "I repeat my thesis in different words throughout": "Rephrase the thesis at least twice in body paragraphs.",
    "My paragraphs tend to be short": "Keep paragraphs to 3-4 sentences max.",
    "I use informal language or slang sometimes": "Include 2-3 informal phrases or colloquialisms.",
    "I have a go-to closing phrase or style": "Use conclusion pattern from fingerprint strictly.",
    "I struggle with commas and punctuation": "Include comma splices and missing commas in 2-3 sentences.",
  };

  const lines: string[] = [];
  for (const h of habits) {
    if (map[h]) lines.push(`   - ${map[h]}`);
  }
  if (other) lines.push(`   - ${other}`);
  return lines.join("\n");
}

// ─── Legacy Prompts (fallback when no fingerprint exists) ───

export function buildLegacyLevel1Prompt(opts: LegacyGenerateOptions): string {
  const { profile, samples, assignment, wordCount, requirements } = opts;
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
