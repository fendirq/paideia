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

function getLevel2ParagraphGuidance(wordCount: number): string {
  if (wordCount >= 1100) {
    return "A long-form essay at this length should usually have 6-8 total paragraphs (intro, 4-6 body, conclusion), not one giant block and not 10+ tiny paragraphs.";
  }
  if (wordCount >= 800) {
    return "A mid-length essay at this length should usually have 5-6 total paragraphs (intro, 3-4 body, conclusion), not one giant block and not 10+ tiny paragraphs.";
  }
  return "A shorter essay at this length should usually have 4-5 total paragraphs (intro, 2-3 body, conclusion), not one giant block and not 10+ tiny paragraphs.";
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

function extractSourceTitles(sourceContext?: string): string[] {
  if (!sourceContext) return [];

  const titles: string[] = [];
  const seen = new Set<string>();
  const regex = /---\s*Source\s+\d+\s*:\s*(.+?)\s*---/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(sourceContext)) !== null) {
    const title = match[1]?.trim();
    if (!title || seen.has(title.toLowerCase())) continue;
    seen.add(title.toLowerCase());
    titles.push(title);
  }

  return titles;
}

function prettifySourceTitle(title: string): string {
  const trimmed = title.trim().replace(/\bpacket excerpt\b/gi, "packet").replace(/\s{2,}/g, " ");
  if (/^al-tabari\b/i.test(trimmed)) return "al-Tabari";
  if (/^(lecture packet|seminar notes|historiographical note|administrative and urban change)/i.test(trimmed)) {
    return `the ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
  }
  if (/\b(notes|packet)\b/i.test(trimmed)) {
    return `the ${trimmed}`;
  }
  return trimmed;
}

/**
 * Returns the most contextually-relevant source title for a generic
 * source-reference phrase like "according to the source" or "the class
 * notes show".
 *
 * The scoring target is the surrounding sentence (or the matched
 * phrase itself, if no context is available). Scoring against ONLY the
 * matched phrase is useless for discrimination — the phrases
 * `"according to the source"` and `"class notes"` never contain
 * source-specific tokens, so the score was always 0 for every title
 * and the function silently returned `titles[0]` for every replacement
 * regardless of what the surrounding sentence was about. That
 * fabricated attributions when multiple sources were in the packet
 * (Codex MEDIUM finding).
 */
function bestSourceReference(
  matchText: string,
  sourceContext?: string,
  surroundingContext?: string,
): string {
  const titles = extractSourceTitles(sourceContext);
  if (titles.length === 0) return "the source";

  const scoringCorpus = `${matchText} ${surroundingContext ?? ""}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");
  const ignoredTokens = new Set([
    "class", "notes", "note", "sources", "source", "discussion",
    "course", "material", "materials", "packet", "packets",
    "shows", "show", "explains", "explain", "describes", "describe",
    "according", "about", "from", "that", "this", "with",
    "their", "they", "these", "those", "what", "when", "which",
    "while", "where", "there", "their", "have", "been", "were",
    "would", "could", "should", "only", "into", "upon", "also",
    "however", "through", "between",
  ]);
  let bestTitle = titles[0];
  let bestScore = -1;

  for (const title of titles) {
    const tokens = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 4 && !ignoredTokens.has(token));
    // Count distinct token matches rather than raw occurrences so a
    // repeated proper noun in one sentence doesn't outweigh a title
    // whose tokens appear once each.
    const score = tokens.reduce(
      (sum, token) => sum + (scoringCorpus.includes(token) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestTitle = title;
    }
  }

  return prettifySourceTitle(bestTitle);
}

/**
 * Extracts the sentence containing the match at `offset` — used to
 * feed surrounding context into `bestSourceReference`.
 *
 * The backward search must cover `.`, `!`, `?`, and newline — if we
 * only split on `.` and `\n`, a citation following a question or
 * exclamation folds the prior sentence into the scoring corpus, so
 * `Was the Battle of the Zab decisive? According to the source,
 * Baghdad...` attributes to the Zab source instead of the Baghdad
 * one.
 */
function sentenceContaining(fullText: string, offset: number, matchLength: number): string {
  const searchUpTo = Math.max(0, offset - 1);
  const boundaries = [".", "!", "?", "\n"].map((c) => fullText.lastIndexOf(c, searchUpTo));
  const sentenceStart = Math.max(...boundaries, -1) + 1;
  const afterMatch = offset + matchLength;
  const endMarks = [".", "!", "?", "\n"].map((c) => fullText.indexOf(c, afterMatch)).filter((i) => i !== -1);
  const sentenceEnd = endMarks.length > 0 ? Math.min(...endMarks) : fullText.length;
  return fullText.slice(sentenceStart, sentenceEnd).trim();
}

function sourceReferenceSentenceStart(reference: string): string {
  if (/^the\s/i.test(reference)) {
    return reference.replace(/^the\s/i, "The ");
  }
  return reference.charAt(0).toUpperCase() + reference.slice(1);
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

/**
 * Detect narrative/creative assignments from rubric + prompt keywords. For
 * creative writing, the samples are full-text scenes with specific imagery;
 * "match the voice" easily collapses into "template the specific scenes."
 * Phase 3 stress test surfaced this — creative-writing scored overall 4/10
 * with mad-libs-style plagiarism while argumentative fixtures scored 8-9.
 */
export function isNarrativeAssignment(assignment: string, requirements?: string): boolean {
  const text = `${assignment}\n${requirements ?? ""}`.toLowerCase();
  const signals = [
    "personal narrative",
    "creative nonfiction",
    "narrative essay",
    "memoir",
    "scene construction",
    "scene vs summary",
    "sensory detail",
    "lived experience",
    "first-person narrative",
  ];
  return signals.some((signal) => text.includes(signal));
}

/**
 * Detects comparative-analysis assignments (compare/contrast, compare,
 * etc). Drives a block of comparative-specific craft directives in the
 * Level 2 Writing prompt — e.g. parallel criteria, comparative claim
 * per paragraph, point-by-point vs block selection by complexity.
 * Sources: Harvard comparative-analysis guide; UMGC compare/contrast.
 */
export function isComparativeAssignment(assignment: string, requirements?: string): boolean {
  const text = `${assignment}\n${requirements ?? ""}`.toLowerCase();
  const signals = [
    "compare and contrast",
    "comparative analysis",
    "comparative essay",
    "comparison essay",
    "compare ",
    "contrast ",
    " vs ",
    " vs. ",
    "similarities and differences",
    "similar and different",
    "juxtapose",
    "side by side",
  ];
  return signals.some((signal) => text.includes(signal));
}

// ─── Level 2 Writing Prompt (sample-first generation) ───

export function buildLevel2WritingPrompt(opts: GenerateOptions, outline: string): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, samples, assignment, wordCount, requirements, sourceContext } = opts;

  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);
  const isNarrative = isNarrativeAssignment(assignment, requirements);
  const isComparative = !isNarrative && isComparativeAssignment(assignment, requirements);

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

  return `${isNarrative
    ? `NARRATIVE VOICE REFERENCE — you will work from the structured voice profile below, NOT from the student's raw prior essays.

This is deliberate: narrative voice is easy to describe abstractly (sentence rhythm, sensory channel, dialogue habits, attention patterns) but raw sample text causes structural plagiarism. Gemini's attention on concrete sample sentences overrides abstract instructions "not to copy" — we avoid that trap by keeping the samples out of your context.

Your job: read the voice profile below, the self-report, and the assignment prompt. Then invent an original scene with its own subject, opening move, cast, setting, and ending. The subject must not be something the student has written about before (the profile may hint at their past topics — avoid them).

Write in the student's voice as described. Let the voice live in sentence cadence, word choice, sensory attention, and analytical stance. Do NOT try to reproduce specific images, phrases, or paragraph structures you might have seen before — those are not part of this prompt.`
    : `THEIR ACTUAL WRITING — study this carefully before you begin. This is how they really write:

${refSamples}

Read the samples above multiple times. Notice how they build paragraphs, how long their sentences are, how they introduce evidence, what transitions they use, what mistakes they make, how sophisticated (or not) their vocabulary is. You must write the way THEY write.`}

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

${isNarrative ? `NARRATIVE CRAFT GUIDELINES — follow these in priority order (thesis-and-evidence rules DO NOT apply here):

1. SCENE OVER SUMMARY (MANDATORY):
Ground the essay in at least 2-3 concrete scenes. Show what happened, not what it meant. Scenes need time, place, action, and at least one sensory detail per paragraph. Do NOT lead paragraphs with thesis statements or analytical claims.

2. VOICE FINGERPRINT (MANDATORY):
${fingerprint.voice.contractions ? "- Contractions: the student uses them naturally. Keep that rhythm where it fits." : "- Match the student's formality level without forcing contractions."}
${fingerprint.voice.toneDescription ? `- Tone: ${fingerprint.voice.toneDescription}. Preserve that register.` : ""}
Narrative voice lives in sentence cadence, sensory attention, and dialogue handling — not in analytical transitions. Do NOT use "that matters because," "this shows," or "in other words" — those belong in argumentative writing.

3. SENTENCE VARIETY:
Vary sentence length for readability and rhythm. Avoid 3+ consecutive sentences of similar length.

4. ORIGINAL IMAGES AND DIALOGUE (MANDATORY):
Every concrete detail (object, setting, dialogue line) must be invented for this assignment. Do NOT reuse images, scenes, or dialogue structures that echo the student's prior work.

5. NO ANALYTICAL SCAFFOLDING:
Narrative essays do NOT need a thesis, body paragraphs with evidence-explanation-significance, or a restated-thesis conclusion. Let meaning emerge from scene and detail. Over-explaining the "lesson" breaks immersion and tanks the craft score.

6. TARGET: ~${wordCount} words.

AVOID THESE NARRATIVE FAILURE MODES:
- Breaking the fourth wall to cite class notes, the rubric, or craft expectations
- Starting or ending with a generic reflection like "I learned that..." or "This experience taught me..."
- Over-qualified metaphors ("it was, in some ways, like...") — commit to the image

Write the essay now. Return ONLY the essay text, no commentary or headers.` : `CRITICAL GUIDELINES — follow these in order of priority:

1. PARAGRAPH STRUCTURE (MANDATORY):
Each body paragraph MUST contain ${fingerprint.structure.avgParagraphLength} sentences (±1). Follow: "${fingerprint.structure.bodyParagraphPattern}". ${getLevel2ParagraphGuidance(wordCount)} Count your sentences per paragraph before finishing.

2. SENTENCE VARIETY / BURSTINESS (MANDATORY — this is how AI detectors work):
AI detectors measure sentence-length standard deviation ("burstiness"). You MUST score above 7.0 or the essay WILL be flagged.
How to achieve this — every body paragraph must contain ALL of these:
- One SHORT sentence (4-8 words): "This matters." / "The dream fails." / "Gatsby never recovers." / "That changes everything."
- One LONG sentence (28-40 words): compound or complex, with clauses joined by commas, dashes, or conjunctions
- Several MEDIUM sentences (12-22 words) in between
Real students write in bursts: a clumsy short sentence, then a rambling long one, then something average. NEVER write 3+ consecutive sentences of similar length. If you notice a run of 15-20 word sentences, break the pattern immediately with a very short or very long one.

3. VOICE MARKERS (MANDATORY):
Preserve the student's recognizable voice markers without copying their weakest mistakes.
${fingerprint.voice.contractions ? "- Contractions: They use contractions naturally. Keep that casual rhythm where it sounds authentic, and include a few contractions across the essay when they fit." : "- Keep the student's overall formality level, but do not force contractions if they do not use them."}
${fingerprint.voice.toneDescription ? `- Tone: ${fingerprint.voice.toneDescription}. Preserve their natural register and phrasing habits.` : ""}
${fingerprint.transitions.favorites.length ? `- Favorite transitions and sentence patterns: ${fingerprint.transitions.favorites.join(", ")}.` : ""}
Do NOT introduce sentence fragments, broken grammar, typo-like spelling errors, or fake awkwardness just to sound human.

4. VOCABULARY CEILING (MANDATORY):
This student's vocabulary tier is "${fingerprint.vocabulary.tier}". Their go-to words: ${fingerprint.vocabulary.signatureWords.join(", ")}.
BANNED vocabulary (too advanced for this student): "elusive", "unbridgeable", "multifaceted", "spiritually bankrupt", "pervasive", "profound", "encompasses", "transcends", "illuminates", "underscores", "epitomizes", "juxtaposition"
Instead of fancy words, use the simple ones real students use: "shows", "proves", "is about", "means that", "is important because", "represents". When in doubt, pick the simpler word.

5. EVIDENCE INTEGRATION (MANDATORY — college rubric, not high-school):
Do NOT hide behind placeholders like "in class we talked about", "in the sources you can see", "history shows", or "the text says" unless you immediately name the actual evidence. Use concrete details whenever the topic allows it: people, cities, groups, policies, events, regions, dates, or direct source claims.
${sourceContext ? "If approved source material is provided, pull your evidence from it and name it directly. Do not invent source details that are not in the provided material." : ""}
${!sourceContext ? "If no approved source material is provided, still use concrete evidence, but keep it to the kind of major details a well-prepared student could plausibly remember without research. Prefer major names, events, places, and policies over obscure dates or niche facts. Pick a few strong examples and develop them instead of trying to sound comprehensive." : ""}
If the prompt or rubric requires a minimum number of evidence pieces, actually hit that number.

How A-level papers actually integrate evidence (Princeton/Harvard rubric standards):
${sourceContext ? `- FRAME FIRST: one sentence of framing BEFORE each quote or paraphrase — name the source or speaker, provide needed context, and state what point the evidence will help prove.
- PREFER PARAPHRASE: use paraphrase when you need the idea; use a direct quote ONLY when the exact wording, tone, or phrasing is what you will analyze in the next sentences.
- NEVER end a body paragraph on quoted material or source summary — the paragraph must end in the writer's own analytical voice.
- AFTER each quote or paraphrase, write at least 2 sentences of analysis explaining what the evidence implies, how it supports or complicates the paragraph claim, and why that matters for the thesis.
- Use precise reporting verbs: 'argues', 'suggests', 'implies', 'concedes', 'reveals', 'demonstrates' — pick the verb that matches the source's action. Do not lean on generic 'says' or inflated 'illuminates'.` : `- NO FABRICATED SOURCES. You do not have an approved source packet. Do NOT reference "the source packet", "our packet", "the provided excerpt", or cite invented scholars/critics/reviewers. If you want the weight of authority, name a well-known text, figure, or event directly (e.g. "Frankenstein's creature tells Victor..." not "The critical essay by Anne Mellor in our packet..."). Fabricated citations are a rubric disqualifier — they fail the source-integration floor more dramatically than no citation at all.
- FRAME FIRST when you name a specific text, figure, or event: one sentence of orientation (who/what, when relevant) before the claim grounded in it.
- PREFER PARAPHRASE over pretend-quotation. Only put something in quotes if you are confident the exact words are from the text and genuinely widely-known.
- AFTER a concrete reference (a named event, character, or widely-known claim), write at least 1-2 sentences of analysis explaining what it implies and why it matters for the thesis.
- Use precise verbs when describing named figures or events: 'argues', 'suggests', 'implies', 'reveals', 'demonstrates' — over generic 'says' or inflated 'illuminates'.`}

6. COLLEGE-RUBRIC CRAFT (MANDATORY — what turns a B paper into an A):
- THESIS STAKES: the introduction's thesis must be arguable AND state why the claim matters (what is at stake, what it changes, why the reader should care). A descriptive topic statement ('This essay discusses X') is a B-range miss.
- TOPIC SENTENCES AS SUBCLAIMS: each body paragraph's first sentence is a debatable subclaim that supports the thesis. Read only the first sentences of all body paragraphs in order — they should outline the argument's logic.
- "SO WHAT" PER PARAGRAPH: near the end of each body paragraph, include a sentence that names the consequence, pattern, contradiction, or larger implication the evidence revealed. Do not leave the interpretive work to the reader.
- COUNTERARGUMENT: at least once in the essay, introduce a plausible counterargument, counterexample, or alternative interpretation and respond to it by refining or defending the thesis. Skipping this is a hallmark of C-range work.
- CONCLUSION SYNTHESIZES, DOES NOT REPEAT: do not restate the introduction word-for-word. Synthesize how the main claims fit together, restate the stakes in broader terms, and end with a clear "so what / now what" implication.
- MEASURED ASSERTION: sound confident but not totalizing. Avoid both overclaiming ('proves once and for all') and deflating hedges ('kind of', 'maybe' everywhere). Match verb/qualifier strength to the evidence.

${isComparative ? `7. COMPARATIVE-ANALYSIS STRUCTURE (MANDATORY — this is a comparison assignment):
- STRUCTURE BY COMPLEXITY: choose point-by-point structure (alternate between both subjects inside each body paragraph) for complex comparisons; use block structure (all of subject A, then all of subject B) ONLY for short or simple comparisons.
- PARALLEL CRITERIA (fair-play rule): if you compare A and B by criteria 1, 2, 3, you MUST use the same criteria for both, in the same order.
- COMPARATIVE CLAIM PER PARAGRAPH: every body paragraph makes an explicit comparative claim using both subjects under the same lens. Do NOT discuss A and B separately without stating what the juxtaposition proves.
- SYMMETRY: both subjects get real analysis — not "A gets three paragraphs of analysis, B gets one token paragraph." Comparative asymmetry drags A papers to B.
- SYNTHESIS CONCLUSION: the conclusion names the relationship between the two subjects and restates why the comparison mattered in the first place.

8. QUALITY FLOOR:` : "7. QUALITY FLOOR:"}
This must read like the strongest, most educated version of this writer.
- Clear thesis in the introduction
- Concrete evidence, not generic placeholders
- Explanation after each major piece of evidence
- Grammatically clean prose
- Strong organization and focused body paragraphs
- A-range in clarity and argument, not textbook-level precision
- Depth over coverage. A strong student essay should feel selective, not encyclopedic.
- Preserve the student's recognizable style signatures, but do NOT preserve incoherence, weak grammar, or low-effort development.

${isComparative ? "9. " : "8. "}TARGET: ~${wordCount} words.

AVOID THESE AI-DETECTOR RED FLAGS:
"delve into", "it's important to note", "in today's society", "furthermore", "multifaceted", "nuanced", "pivotal", "underscores", "highlights the importance of", "it is worth noting", "plays a crucial role", "serves as a testament", "serves as a powerful", "devastating portrait", "compelling narrative"

Write the essay now. Return ONLY the essay text, no commentary or headers.`}`;
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

You are a ruthless writing-forensics reviewer. Compare the generated essay against the student's real samples and identify the strongest signs that the essay does NOT fully sound like them yet, while also checking whether it reaches a polished A-range quality floor.

Prioritize:
- sentence rhythm / burstiness
- paragraph size and structure
- vocabulary ceiling
- evidence integration habits
- transition habits and sentence openers
- grammar and sentence coherence
- tone / register slips
- places where the essay is too generic, too vague, or too weakly argued

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
  assignment?: string,
  requirements?: string,
): string {
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);
  const isNarrative = isNarrativeAssignment(assignment ?? "", requirements);

  const referenceBlock = isNarrative
    ? `STUDENT'S VOICE PROFILE (narrative mode — raw samples withheld to prevent structural plagiarism):

${narrative}

For narrative assignments we do NOT show you the student's raw prior essays. Rewrite based on the voice profile above and on what the current essay is already doing well. If a sentence in the current essay looks like it was lifted from something elsewhere, REPLACE it with an original sentence in the same cadence — do not "fix" it by pulling toward external text.`
    : `STUDENT'S REAL WRITING — this is the reference standard:

${refSamples}`;

  return `${referenceBlock}

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

3. GRAMMAR & CLARITY CHECK:
   The essay should be grammatically clean and coherent. Fix sentence fragments, broken transitions, repetitive filler, or accidental roughness. Preserve the student's rhythm and tone, but do NOT preserve actual writing mistakes that drag the essay below an A-range standard.
   ${fingerprint.voice.contractions ? "This student uses contractions. Keep them where natural, but do not force them in ways that make sentences weaker." : ""}

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

${!sourceContext ? `8. NO-SOURCE PLAUSIBILITY CHECK:
   If no approved source material is provided, cut any detail that sounds like outside research or historian-level precision. Keep the strongest well-known facts, but avoid stacking exact dates, rare names, or over-explained background unless a prepared student could plausibly know them from class.

` : ""}${sourceContext ? "8." : "9."} Any passage that reads too generic, too weakly argued, or not thesis-driven enough for the assignment.

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

${sourceContext ? "9." : "10."} TRANSITION & OPENER CHECK (count carefully):
   Go through every sentence and write down its first word. Count how many start with "The".
   RULES:
   - If more than 40% of sentences start with "The", you MUST rewrite 3-4 of them. Use: "Fitzgerald's...", "This...", "Here,...", "In the novel,...", "What emerges is..."
   - NEVER have 3+ consecutive sentences starting with the same word. If you see "The X... The Y... The Z...", rewrite the middle one.
   - Vary openers across the essay — no single word should dominate.
   ${fingerprint.transitions.favorites.length ? `This student overuses these transitions: ${fingerprint.transitions.favorites.join(", ")}. Make sure at least 2-3 of them appear in the essay — their absence is suspicious.` : ""}
   ${fingerprint.transitions.neverUses.length ? `They NEVER use: ${fingerprint.transitions.neverUses.join(", ")}. Remove any instances.` : ""}

IMPORTANT:
- Improve the essay's quality to an A-range standard while preserving the student's recognizable voice
- Do NOT turn it into stiff academic boilerplate
- Preserve everything that already sounds like the student
- Return ONLY the corrected essay, no commentary`;
}

// ─── Level 2 Expansion Prompt (pass 5 — recover length + specificity without changing voice) ───

export function buildLevel2ExpansionPrompt(
  essay: string,
  opts: GenerateOptions,
  critiqueNotes?: string,
): string {
  const { fingerprint, samples, assignment, wordCount, requirements, sourceContext } = opts;
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

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

Keep the same thesis, argument order, and overall student voice, but expand this essay so it feels like a complete, polished, high-performing essay from this writer.

MANDATORY RULES:
- Target about ${wordCount} words. Do not stay far under.
- Expand EXISTING body paragraphs first. Do not turn this into a brand-new essay.
- Add concrete evidence instead of placeholders. Replace vague lines like "in class", "in the sources", "we learned that", or "history shows" with actual details whenever the topic allows it: named people, groups, cities, policies, events, dates, or direct source claims.
- If source material is provided, use it as the evidence pool. Name those examples directly instead of speaking in generalities.
- If no source material is provided, prefer major, high-confidence facts a prepared student would plausibly remember. Do not pad with obscure or textbook-sounding detail, and do not try to cover every possible angle.
- If the rubric asks for a minimum number of evidence pieces, make sure the draft actually reaches that threshold.
- Keep the student's natural style signatures, but do not preserve weak grammar, vague evidence, or underdeveloped analysis.
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

// ─── Level 2 Compliance Prompt (pass 6 — satisfy assignment without losing voice) ───

export function buildLevel2CompliancePrompt(
  essay: string,
  opts: GenerateOptions,
  {
    minWords,
    maxWords,
  }: {
    minWords?: number | null;
    maxWords?: number | null;
  } = {},
): string {
  const { fingerprint, samples, assignment, wordCount, requirements, sourceContext } = opts;
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

  return `STUDENT'S REAL WRITING — protect this voice:

${refSamples}

---

CURRENT ESSAY:

${essay}

---

WRITER'S PROFILE:

${narrative}

---

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

---

YOUR TASK:

Make the essay satisfy the assignment and rubric while still sounding like this writer. Keep the same overall argument and voice signatures, but raise it to a polished A-range standard.

MANDATORY CHECKS:
- The introduction must contain a clear thesis that answers BOTH parts of the assignment, not just the topic generally.
- The essay must include at least 3 concrete pieces of evidence if the rubric asks for it.
- Every piece of evidence must be followed by explanation of why it matters.
- Each body paragraph should stay focused on one main point.
- Fix accidental broken fragments that feel like editing mistakes rather than authentic student writing, especially sentences that begin with "Which", "Because", or similar leftovers and do not read naturally.
- Keep the essay around ${wordCount} words.${minWords ? ` It must not land below ${minWords} words.` : ""}${maxWords ? ` Try not to exceed ${maxWords} words.` : ""}
- Use approved source material when it is provided. Do not invent outside evidence.
${!sourceContext ? "- Without approved source material, keep the specificity student-plausible. Use concrete examples, but do not sound like a textbook or historian. Prioritize 3-4 strong examples over trying to sound exhaustive." : ""}
${fingerprint.voice.contractions ? "- Keep a few natural contractions in the essay so the voice does not become more formal than the student's real writing." : ""}

IMPORTANT:
- Keep the natural student diction and rhythm.
- Do not preserve broken grammar, vague filler, or low-quality development just because it appears in the samples.
- Do not add headers or commentary.

Return ONLY the revised essay.`;
}

// ─── Level 2 Evidence Integration Prompt (pass 6 — source-backed analysis enforcement) ───

export function buildLevel2EvidenceIntegrationPrompt(
  essay: string,
  opts: GenerateOptions,
  {
    requiredEvidenceCount,
  }: {
    requiredEvidenceCount?: number | null;
  } = {},
): string {
  const { fingerprint, samples, assignment, requirements, sourceContext } = opts;
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

  return `STUDENT'S REAL WRITING — protect this voice:

${refSamples}

---

CURRENT ESSAY:

${essay}

---

WRITER'S PROFILE:

${narrative}

---

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

---

YOUR TASK:

Strengthen this essay's evidence and analysis without changing its overall argument or recognizable voice.

MANDATORY CHECKS:
- Every body paragraph must contain a concrete historical example, not just a general statement.
- Every major example must be followed by 1-2 sentences explaining why it matters.
- Tie each body paragraph back to the thesis before moving on.
${requiredEvidenceCount ? `- The essay must clearly include at least ${requiredEvidenceCount} distinct pieces of evidence.` : ""}
- If a paragraph already has one strong example, deepen the explanation before piling on extra facts.
- ${sourceContext ? "When approved source material is present, prefer it over generic background knowledge. Refer to the actual event, person, or source claim instead of generic phrases like \"class notes explain\" whenever possible." : "If no approved source material is present, use 3-5 concrete, high-confidence details a prepared student could plausibly remember from class. Prefer major names, events, places, and policies over niche facts or stacked dates, and do not try to cover everything."}
- Add direct source phrasing when natural, such as \"the source shows\" or \"class notes explain,\" but only if the source context actually supports it.
- Do not add fake citations, invented quotes, or niche specifics that were never established.

IMPORTANT:
- Keep the student's natural diction and rhythm.
- Do not weaken the thesis or reduce clarity.
- Do not add headers or commentary.

Return ONLY the revised essay.`;
}

// ─── Level 2 Attribution Prompt (pass 7 — source phrasing + trim) ───

export function buildLevel2AttributionPrompt(
  essay: string,
  opts: GenerateOptions,
  {
    maxWords,
  }: {
    maxWords?: number | null;
  } = {},
): string {
  const { fingerprint, samples, assignment, requirements, sourceContext } = opts;
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

  return `STUDENT'S REAL WRITING — preserve this voice:

${refSamples}

---

CURRENT ESSAY:

${essay}

---

WRITER'S PROFILE:

${narrative}

---

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

---

YOUR TASK:

Make the essay feel clearly grounded in actual source material while keeping the student's natural style.

MANDATORY CHECKS:
- If approved source material exists, include at least one directly attributable source phrase such as "the source shows," "the account of X suggests," or a short integrated quoted phrase if the source context clearly supports it.
- Prefer naming the actual source or speaker over generic phrases like "the class notes explain" or "the source shows."
- Do not invent quotations.
- Do not add fake citation formats.
- Keep evidence phrasing natural and student-like, not academic-boilerplate.
${maxWords ? `- Trim the essay so it does not exceed ${maxWords} words.` : ""}
- Preserve thesis, evidence quality, and grammar.

IMPORTANT:
- Keep the essay human and readable.
- Do not make it sound robotic or over-edited.
- Do not add headers or commentary.

Return ONLY the revised essay.`;
}

// ─── Level 2 Naturalness Prompt (pass 8 — reduce polish + repetitive phrasing) ───

export function buildLevel2NaturalnessPrompt(
  essay: string,
  opts: GenerateOptions,
): string {
  const { fingerprint, samples, assignment, requirements, sourceContext } = opts;
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

  return `STUDENT'S REAL WRITING — match this level and texture:

${refSamples}

---

CURRENT ESSAY:

${essay}

---

WRITER'S PROFILE:

${narrative}

---

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

---

YOUR TASK:

Keep the same argument, evidence, and overall structure, but make the essay sound more naturally like this student's real writing.

MANDATORY CHECKS:
- Simplify any sentence that sounds more polished, textbook-like, or over-explained than the real samples.
- Replace repetitive analytical phrasing like "This shows," "This matters because," "According to," or other formulaic sentence starters when they repeat too often.
- Keep some student-like repetition, but do not let the same analytical opener dominate the essay.
- Use a few direct, plainspoken statements instead of turning every idea into polished commentary.
${sourceContext ? "- Keep source attribution when it is supported by the provided material, but make it feel natural instead of mechanical." : "- Do NOT pretend you have class notes, class sources, or a source packet. If the essay mentions them, rewrite those lines so they state the evidence directly."}
- Preserve the concrete evidence and thesis. Do not make the essay vaguer.

IMPORTANT:
- Keep the student's natural diction and rhythm.
- Do not add headers or commentary.
- Do not remove major historical details that are already helping the essay satisfy the assignment.

Return ONLY the revised essay.`;
}

export function buildLevel2TrimPrompt(
  essay: string,
  opts: GenerateOptions,
  {
    maxWords,
  }: {
    maxWords: number;
  },
): string {
  const { fingerprint, samples, assignment, requirements, sourceContext } = opts;
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

  return `STUDENT'S REAL WRITING — preserve this voice:

${refSamples}

---

CURRENT ESSAY:

${essay}

---

WRITER'S PROFILE:

${narrative}

---

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

---

YOUR TASK:

Trim this essay so it does not exceed ${maxWords} words while preserving the thesis, evidence, and student voice.

MANDATORY RULES:
- Cut repetition, over-explanation, and the least necessary background first.
- Keep all major required elements already present.
- Do not weaken the thesis.
- Keep the student's natural diction and rhythm.
- Keep source naming natural and specific when sources are provided.
- Do not add headers or commentary.

Return ONLY the revised essay.`;
}

export function buildLevel2SourceFlowPrompt(
  essay: string,
  opts: GenerateOptions,
  {
    maxWords,
  }: {
    maxWords?: number | null;
  } = {},
): string {
  const { fingerprint, samples, assignment, requirements, sourceContext } = opts;
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

  return `STUDENT'S REAL WRITING — preserve this voice:

${refSamples}

---

CURRENT ESSAY:

${essay}

---

WRITER'S PROFILE:

${narrative}

---

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

---

YOUR TASK:

Smooth the essay's source integration and repetitive analytical phrasing without changing its argument, paragraph structure, or overall student voice.

MANDATORY RULES:
- Replace generic or mechanical source phrasing like "According to the source" or "the packet shows" with more natural, specific source naming when possible.
- Keep source references light. Name the source when it matters, but do not make every paragraph sound citation-heavy.
- Vary repetitive analytical openers like "This shows," "That matters because," "In other words," and "According to..."
- Preserve the same paragraph count and overall evidence set.
- Do not add new evidence, new quotes, or new arguments.
- Do not make the essay more formal or more polished than the student samples.
${maxWords ? `- Keep the essay at or under ${maxWords} words.` : ""}

IMPORTANT:
- Keep the student's natural diction and rhythm.
- Keep the thesis and all required assignment elements.
- Do not add headers or commentary.

Return ONLY the revised essay.`;
}

export function stripUnsupportedSourceAttribution(essay: string): string {
  let result = normalizeQuotes(essay);

  const attributionPatterns = [
    /\bAccording to (?:the |our )?class (?:notes|sources|discussion),\s*/gi,
    /\bAccording to (?:the |our )?class (?:notes|sources) on [^,]+,\s*/gi,
    /\bAs (?:we )?(?:discussed|covered|learned) in class,\s*/gi,
    /\bAs (?:our )?class (?:notes|sources) (?:show|explain),\s*/gi,
    /\bAs the course material on [^,]+ shows,\s*/gi,
    /\bAs the course materials on [^,]+ show,\s*/gi,
    /\b(?:The |Our )class (?:notes|sources) (?:show|explain|make clear) that\s*/gi,
    /\b(?:The |Our )class discussion (?:showed|explained) that\s*/gi,
    /\bAs (?:our )?class discussion (?:showed|explained),\s*/gi,
  ];

  for (const pattern of attributionPatterns) {
    result = result.replace(pattern, "");
  }

  return result
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix: string, ch: string) => `${prefix}${ch.toUpperCase()}`)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeSupportedSourceAttribution(essay: string, sourceContext?: string): string {
  // Each replace callback passes the surrounding sentence to
  // `bestSourceReference` so scoring considers the actual topical
  // content (e.g., "Baghdad", "Zab", "mawali") rather than just the
  // generic phrase ("class notes") — which was the Codex-flagged bug
  // that made every replacement collapse to source 1.
  const normalized = normalizeQuotes(essay);

  // Narrow the type to the `replace(pattern, callback)` overload that
  // includes the position and full-string arguments. `args` is
  // `[matchText, ...captureGroups, offset, fullString]`; our patterns
  // have no capture groups so the last two args are offset + full string.
  const withSurrounding =
    (transform: (match: string, reference: string) => string) =>
    (match: string, ...args: unknown[]): string => {
      const offset = typeof args[args.length - 2] === "number" ? (args[args.length - 2] as number) : 0;
      const fullText = typeof args[args.length - 1] === "string" ? (args[args.length - 1] as string) : "";
      const surrounding = sentenceContaining(fullText, offset, match.length);
      return transform(match, bestSourceReference(match, sourceContext, surrounding));
    };

  return normalized
    .replace(
      /\bAccording to (?:the |our )?(?:class |revolution )?(?:notes|sources|discussion)(?: on [^,]+)?,\s*/gi,
      withSurrounding((_match, ref) => `According to ${ref}, `),
    )
    .replace(
      /\bAs (?:our )?class (?:notes|sources) (?:show|explain),\s*/gi,
      withSurrounding((_match, ref) => `As ${ref} shows, `),
    )
    .replace(
      /\bAs the course material on [^,]+ shows,\s*/gi,
      withSurrounding((_match, ref) => `As ${ref} shows, `),
    )
    .replace(/\bAs the course materials on [^,]+ show,\s*/gi, () => "As the source packet shows, ")
    .replace(
      /\bAccording to the source,\s*/gi,
      withSurrounding((_match, ref) => `According to ${ref}, `),
    )
    .replace(/\bAccording to the sources,\s*/gi, () => "According to the source packet, ")
    .replace(
      /\bAs the source shows,\s*/gi,
      withSurrounding((_match, ref) => `As ${ref} shows, `),
    )
    .replace(/\bAs the sources show,\s*/gi, () => "As the source packet shows, ")
    .replace(
      /\b(?:The |Our )?(?:class |revolution )?(?:notes|sources|discussion) (?:show|explain|make clear) that\s*/gi,
      withSurrounding((_match, ref) => `${sourceReferenceSentenceStart(ref)} shows that `),
    )
    .replace(
      /\bThe source shows that\s*/gi,
      withSurrounding((_match, ref) => `${sourceReferenceSentenceStart(ref)} shows that `),
    )
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function polishLevel2SurfaceVoice(essay: string, fingerprint: StyleFingerprint): string {
  let result = normalizeQuotes(essay);

  if (fingerprint.voice.contractions) {
    result = injectContractions(result, 3, 5);
  }

  result = stripEmDashes(result);
  return result.replace(/\.{2,}/g, ".");
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
    /,\s+(also\s)/i,
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
