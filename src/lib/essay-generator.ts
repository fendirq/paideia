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

// ─── Level 2 Plan Prompt (simplified structural outline) ───

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

// ─── Level 2 Writing Prompt (sample-first generation) ───

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

// ─── Level 2 Audit Prompt (pass 3 — forensic sample comparison) ───

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
