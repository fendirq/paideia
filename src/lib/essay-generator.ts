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

function sampleHasFirstPerson(content: string): boolean {
  return /\b(I|my|me|we|our|us)\b/i.test(content);
}

export function shouldAllowFirstPerson(
  fingerprint: StyleFingerprint,
  samples: Sample[],
): boolean {
  if (fingerprint.voice.perspective === "first-person") return true;
  if (fingerprint.voice.perspective === "third-person") return false;
  const sampleHits = samples.filter((sample) => sampleHasFirstPerson(sample.content)).length;
  return sampleHits >= Math.max(1, Math.ceil(samples.length / 2));
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
  if (/^lecture packet on social grievances$/i.test(trimmed)) return "the packet's discussion of social grievances";
  if (/^seminar notes on the battle of the zab$/i.test(trimmed)) return "the packet's note on the Zab";
  if (/^historiographical note for comparison$/i.test(trimmed)) return "the packet's later interpretation";
  if (/^administrative and urban change under the early abbasids$/i.test(trimmed)) return "the packet's discussion of early Abbasid administration";
  if (/^(lecture packet|seminar notes|historiographical note|administrative and urban change)/i.test(trimmed)) {
    return `the ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}`;
  }
  if (/\b(notes|packet)\b/i.test(trimmed)) {
    return `the ${trimmed}`;
  }
  return trimmed;
}

function bestSourceReference(matchText: string, sourceContext?: string): string {
  const titles = extractSourceTitles(sourceContext);
  if (titles.length === 0) return "the source";

  const normalizedMatch = matchText.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const ignoredTokens = new Set(["class", "notes", "note", "sources", "source", "discussion", "course", "material", "materials", "packet", "packets", "shows", "show", "explains", "explain", "describes", "describe"]);
  let bestTitle = titles[0];
  let bestScore = -1;

  for (const title of titles) {
    const tokens = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 4 && !ignoredTokens.has(token));
    const score = tokens.reduce((sum, token) => sum + (normalizedMatch.includes(token) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestTitle = title;
    }
  }

  return prettifySourceTitle(bestTitle);
}

function sourceReferenceSentenceStart(reference: string): string {
  if (/^the\s/i.test(reference)) {
    return reference.replace(/^the\s/i, "The ");
  }
  return reference.charAt(0).toUpperCase() + reference.slice(1);
}

function extractQuotedPhrasesFromSourceContext(sourceContext?: string): string[] {
  if (!sourceContext) return [];
  const phrases: string[] = [];
  const seen = new Set<string>();
  const regex = /"([^"\n]{2,120})"/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(sourceContext)) !== null) {
    const phrase = match[1]?.trim();
    if (!phrase || seen.has(phrase.toLowerCase())) continue;
    seen.add(phrase.toLowerCase());
    phrases.push(phrase);
  }

  return phrases;
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
  const allowFirstPerson = shouldAllowFirstPerson(fingerprint, samples);

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
Each body paragraph MUST contain ${fingerprint.structure.avgParagraphLength} sentences (±1). Follow: "${fingerprint.structure.bodyParagraphPattern}". ${getLevel2ParagraphGuidance(wordCount)} Count your sentences per paragraph before finishing.
Within each body paragraph, make the logic clear: claim, evidence, explanation, then connection back to the argument. Do not just stack facts.

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
- In analytical writing, do not use first-person framing like \"I think,\" \"I would argue,\" or \"what stands out to me\" at all. For this kind of history essay, direct analytical phrasing is better even if the samples are mixed.
Do NOT introduce sentence fragments, broken grammar, typo-like spelling errors, or fake awkwardness just to sound human.

4. VOCABULARY CEILING (MANDATORY):
This student's vocabulary tier is "${fingerprint.vocabulary.tier}". Their go-to words: ${fingerprint.vocabulary.signatureWords.join(", ")}.
BANNED vocabulary (too advanced for this student): "elusive", "unbridgeable", "multifaceted", "spiritually bankrupt", "pervasive", "profound", "encompasses", "transcends", "illuminates", "underscores", "epitomizes", "juxtaposition"
Instead of fancy words, use the simple ones real students use: "shows", "proves", "is about", "means that", "is important because", "represents". When in doubt, pick the simpler word.

5. EVIDENCE SPECIFICITY (MANDATORY):
Do NOT hide behind placeholders like "in class we talked about", "in the sources you can see", "history shows", or "the text says" unless you immediately name the actual evidence. Use concrete details whenever the topic allows it: people, cities, groups, policies, events, regions, dates, or direct source claims. A real student may be simple, but they still mention the actual thing they are talking about.
${sourceContext ? "If approved source material is provided, pull your evidence from it and name it directly. Do not invent source details that are not in the provided material." : ""}
${!sourceContext ? "If no approved source material is provided, still use concrete evidence, but keep it to the kind of major details a well-prepared student could plausibly remember without research. Prefer major names, events, places, and policies over obscure dates or niche facts. Pick a few strong examples and develop them instead of trying to sound comprehensive." : ""}
If the prompt or rubric requires a minimum number of evidence pieces, actually hit that number.
When a quote is used, introduce it by naming the source or speaker and explain what the wording proves or changes. In history-style writing, name the source in prose when you can; in literature-style writing, weave the quotation into the sentence and analyze it immediately after.
${sourceContext ? `When source material is provided, write as if the student has actually absorbed it. Do NOT sound like you are reporting from an assignment packet. Avoid phrases like "the packet says," "the source packet argues," or "the lecture notes explain" unless there is no more natural way to identify the source.
- Use at most 1-2 short integrated quoted phrases unless the rubric explicitly demands more.
- Keep quotations short and embedded in the sentence, not dropped in as separate evidence blocks.
- After source evidence, move quickly back into the student's own analysis.
- Source references should support the argument, not become the paragraph's main texture.` : ""}
- Prefer concrete historical naming over meta-phrases like "what stands out in that framing" or "the best description is." The prose should sound argued, not workshop-like.

6. QUALITY FLOOR:
This must read like the strongest, most educated version of this writer.
- Clear thesis in the introduction
- Concrete evidence, not generic placeholders
- Explanation after each major piece of evidence
- Grammatically clean prose
- Strong organization and focused body paragraphs
- A-range in clarity and argument, not textbook-level precision
- Depth over coverage. A strong student essay should feel selective, not encyclopedic.
- Direct analytical prose. The essay should feel argued, not narrated and not assembled from notes.
- Preserve the student's recognizable style signatures, but do NOT preserve incoherence, weak grammar, or low-effort development.

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
- ${sourceContext ? "When approved source material is present, prefer it over generic background knowledge. Refer to the actual event, person, or source claim instead of generic phrases like \"class notes explain\" whenever possible. If the packet contains both a primary source and a later interpretation, keep those voices distinct and compare them explicitly." : "If no approved source material is present, use 3-5 concrete, high-confidence details a prepared student could plausibly remember from class. Prefer major names, events, places, and policies over niche facts or stacked dates, and do not try to cover everything."}
- Add direct source phrasing when natural, but name the actual source or speaker rather than collapsing everything into \"the source\". Any quote should be introduced and then explained.
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
  const quotedPhrases = extractQuotedPhrasesFromSourceContext(sourceContext);

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
- If the source packet contains both a primary source and a later interpretation, keep those voices distinct and do not flatten them into one generic source label.
- Do not invent quotations.
- Do not add fake citation formats.
- Keep evidence phrasing natural and student-like, not academic-boilerplate. The goal is careful analytical prose, not first-person reflection.
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
- Do not add first-person filler like \"I think\" or \"what stands out to me\" at all.
- A few blunt, short sentences are okay if they sound like the student. Do not make every transition or sentence feel carefully polished.
- Add one or two moments of non-first-person hedging when natural, such as \"what strikes me is,\" \"what seems most convincing is,\" \"it seems,\" \"maybe,\" or \"in some ways.\"
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
- Add 2-4 moments of student-like hedging or direct interpretive language when natural, such as "what matters is," "what seems most convincing is," "even so," "still," or similarly direct but non-first-person phrasing, if that better matches the sample voice.
- Simplify any sentence that sounds too perfectly organized, too evenly academic, or too polished compared with the real samples.
- Prefer plainspoken paraphrase over formal packet-language when the source reference is already clear.
- If a paragraph sounds like it is mechanically covering a rubric bullet, loosen it so it reads more like a student making an argument than a checklist being completed.
- Do not lean on the same favorite transition more than once or twice if that repetition starts sounding formulaic.
- Make the ending answer the central question a little more decisively instead of fading out into summary.
- Preserve the same paragraph count and overall evidence set.
- Do not add new evidence, new quotes, or new arguments.
- Do not make the essay more formal or more polished than the student samples.
- One or two blunt, short sentences are okay if they sound natural. Do not make every paragraph feel perfectly balanced or over-engineered.
- Add one or two moments of non-first-person hedging when natural, such as \"it seems,\" \"maybe,\" or \"in some ways,\" but keep the prose direct and analytical.
- Prefer direct academic argument over reflective commentary.
- Do not make every paragraph equally developed. It is okay if one paragraph is tighter and another carries more of the analytical weight.
${maxWords ? `- Keep the essay at or under ${maxWords} words.` : ""}

IMPORTANT:
- Keep the student's natural diction and rhythm.
- Keep the thesis and all required assignment elements.
- Do not add headers or commentary.

Return ONLY the revised essay.`;
}

export function buildLevel2QuoteIntegrationPrompt(
  essay: string,
  opts: GenerateOptions,
  {
    requiredQuoteCount,
    maxWords,
  }: {
    requiredQuoteCount?: number | null;
    maxWords?: number | null;
  } = {},
): string {
  const { fingerprint, samples, assignment, requirements, sourceContext } = opts;
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);
  const quotedPhrases = extractQuotedPhrasesFromSourceContext(sourceContext);

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

Integrate short source quotations naturally into this essay while keeping the same argument, evidence set, and student voice.

MANDATORY RULES:
- Use only short, integrated quoted phrases that are clearly supported by the approved source material.
${requiredQuoteCount ? `- The essay must include at least ${requiredQuoteCount} direct quoted phrase${requiredQuoteCount === 1 ? "" : "s"}.` : "- If the assignment appears to expect direct quotation, include at least one short quoted phrase."}
- Prefer quoted phrases that already appear in the source packet when possible.${quotedPhrases.length ? ` Good candidates include: ${quotedPhrases.slice(0, 3).map((phrase) => `"${phrase}"`).join(", ")}.` : ""}
- Name the source or speaker naturally when it matters. Do not rely on generic phrasing like "the source says."
- If the source packet includes a primary source and a later interpretation, quote the primary source and keep the later interpretation in clear paraphrase or named attribution.
- Do not add block quotes, fake citations, or long quotations.
- After each quotation, explain why that phrase matters for the argument or how its wording changes the interpretation.
- Keep the same paragraph count and overall structure.
- Do not add new evidence or new arguments beyond what is already in the source packet.
${maxWords ? `- Keep the essay at or under ${maxWords} words.` : ""}

IMPORTANT:
- Keep the student's natural diction and rhythm.
- Do not make the essay sound more formal or more polished than the real samples.
- Do not add headers or commentary.

Return ONLY the revised essay.`;
}

export function buildLevel2SourcedVoicePrompt(
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
  return `STUDENT'S REAL WRITING — keep this exact level of human texture:

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

Keep the same argument, quotations, evidence, and paragraph structure, but make the essay feel a little less perfectly organized and a little more like a real student's live reasoning on the page.

MANDATORY RULES:
- Keep the same paragraph count and the same major points.
- Preserve every required source quotation and all major evidence already present.
- Do not add first-person framing at all. If the prose needs more human texture, use direct but non-first-person phrasing instead.
- Loosen transitions that sound too perfectly engineered or checklist-like.
- It is okay for the prose to be slightly uneven or a little less polished if it feels more human and more faithful to the sample voice.
- A couple of plain, blunt sentences can be better than perfectly elegant phrasing if that sounds more like the student.
- Prefer clearer academic directness over meta-commentary about the essay itself.
- If a sentence becomes too dense, simplify it instead of adding more framing language.
- Do not make every paragraph equally full or equally elegant. A slightly uneven distribution of emphasis can sound more real.
- Do not make the essay sloppy, vague, or incorrect.
- Do not add new evidence or new arguments.
${maxWords ? `- Keep the essay at or under ${maxWords} words.` : ""}

IMPORTANT:
- This should still read like one strong student's essay, not a rough draft.
- Do not add headers or commentary.

Return ONLY the revised essay.`;
}

export function buildLevel2SourcedSynthesisPrompt(
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

Rewrite only the source-and-analysis stitching so the essay reads like one continuous student argument rather than a response assembled from packet notes.

MANDATORY RULES:
- Keep the same thesis, paragraph count, quotations, and major evidence.
- Preserve all required source quotations already present.
- Embed quoted phrases inside the sentence flow when possible instead of announcing them mechanically.
- Avoid phrases like "the packet says," "the source packet argues," or other scaffolding that reminds the reader about the assignment packet.
- If you refer to a source, do it in the most natural way available: name the source or describe the interpretation briefly, then move back into analysis.
- Keep the analysis tied to the thesis. After evidence, explain what it proves, but do not over-explain what is already obvious.
- Do not add first-person framing.
- Do not add new evidence, new quotations, or new arguments.
${maxWords ? `- Keep the essay at or under ${maxWords} words.` : ""}

IMPORTANT:
- The prose should feel like a strong student essay, not a polished literature review.
- Do not add headers or commentary.

Return ONLY the revised essay.`;
}

export function buildLevel2SourcedDraftChoicePrompt(
  {
    candidateA,
    candidateB,
    candidateC,
    opts,
  }: {
    candidateA: string;
    candidateB: string;
    candidateC?: string;
    opts: GenerateOptions;
  },
): string {
  const { fingerprint, samples, assignment, requirements, sourceContext } = opts;
  const refSamples = selectDiverseSamples(samples);
  const narrative = formatFingerprintNarrative(fingerprint);

  return `STUDENT'S REAL WRITING — this is the standard:

${refSamples}

---

WRITER'S PROFILE:

${narrative}

---

ASSIGNMENT:
${assignment}
${requirements ? `\nREQUIREMENTS/RUBRIC:\n${requirements}` : ""}
${sourceContext ? `\n\n${sourceContext}` : ""}

---

CANDIDATE A:

${candidateA}

---

CANDIDATE B:

${candidateB}

---

CANDIDATE C:

${candidateC ?? "(none)"}

---

YOUR TASK:

Choose the best sourced draft for this student and assignment.

PRIORITIES, IN ORDER:
- stronger thesis and evidence handling
- more natural source integration and less packet-like wording
- clearer, more direct academic prose
- better match to the student's real analytical voice
- fewer over-polished or overly systematic passages

RULES:
- Prefer the candidate that reads like the stronger college essay while still sounding plausibly like the student.
- Prefer direct analytical prose over reflective or meta-commentary.
- Prefer the draft that sounds like it is using sources to make an argument, not reporting on packet materials.
- If one draft is slightly more polished but clearly stronger as an argument and more natural with sources, choose it.
- Do not rewrite anything.
- Return only one token: A, B, or C.`;
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
  return normalizeQuotes(essay)
    .replace(/\bAccording to (?:the |our )?(?:class |revolution )?(?:notes|sources|discussion)(?: on [^,]+)?,\s*/gi, (match) => `According to ${bestSourceReference(match, sourceContext)}, `)
    .replace(/\bAs (?:our )?class (?:notes|sources) (?:show|explain),\s*/gi, (match) => `As ${bestSourceReference(match, sourceContext)} shows, `)
    .replace(/\bAs the course material on [^,]+ shows,\s*/gi, (match) => `As ${bestSourceReference(match, sourceContext)} shows, `)
    .replace(/\bAs the course materials on [^,]+ show,\s*/gi, () => "As the source packet shows, ")
    .replace(/\bAccording to the source,\s*/gi, () => `According to ${bestSourceReference("the source", sourceContext)}, `)
    .replace(/\bAccording to the sources,\s*/gi, () => "According to the source packet, ")
    .replace(/\bAs the source shows,\s*/gi, () => `As ${bestSourceReference("the source", sourceContext)} shows, `)
    .replace(/\bAs the sources show,\s*/gi, () => "As the source packet shows, ")
    .replace(/\b(?:The |Our )?(?:class |revolution )?(?:notes|sources|discussion) (?:show|explain|make clear) that\s*/gi, (match) => `${sourceReferenceSentenceStart(bestSourceReference(match, sourceContext))} shows that `)
    .replace(/\bThe source shows that\s*/gi, () => `${sourceReferenceSentenceStart(bestSourceReference("the source", sourceContext))} shows that `)
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function polishSourcedVoiceTexture(
  text: string,
  {
    allowFirstPerson = false,
  }: {
    allowFirstPerson?: boolean;
  } = {},
): string {
  let result = text;

  const replacements: Array<[RegExp, string]> = [
    [/\bthe lecture packet on social grievances\b/gi, "a note in the packet on social grievances"],
    [/\bthe seminar notes on the battle of the zab\b/gi, "a note in the packet on the Zab"],
    [/\bthe seminar discussion of administrative and urban change\b/gi, "the discussion of administrative change in the packet"],
    [/\bthe modern historiographical interpretation in the source packet\b/gi, "a later interpretation in the packet"],
    [/\bone interpretation in the source packet argues\b/gi, "one reading in the packet argues"],
    [/\bthe source packet argues\b/gi, "the packet argues"],
    [/\bthe packet's discussion of social grievances\b/gi, "a note in the packet on social grievances"],
    [/\bthe packet's note on the zab\b/gi, "a note in the packet on the Zab"],
    [/\bthe packet's later interpretation\b/gi, "a later interpretation in the packet"],
    [/\bthe packet's discussion of early abbasid administration\b/gi, "the discussion of early Abbasid administration in the packet"],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  if (allowFirstPerson && !/\bwhat stands out to me is\b/i.test(result)) {
    result = result.replace(/\bWhat stands out is\b/, "What stands out to me is");
  }

  if (!allowFirstPerson) {
    result = result
      .replace(/\bWhat stands out to me is\b/gi, "What stands out is")
      .replace(/\bI do not think that\s+([^,.!?]+?)\s+captures\b/gi, "That $1 does not capture")
      .replace(/\bI don't think that\s+([^,.!?]+?)\s+captures\b/gi, "That $1 does not capture")
      .replace(/\bI do not think that\s+([^,.!?]+?)\s+explains\b/gi, "That $1 does not explain")
      .replace(/\bI don't think that\s+([^,.!?]+?)\s+explains\b/gi, "That $1 does not explain")
      .replace(/\bI do not think that\b/gi, "It is not quite right to say that")
      .replace(/\bI don't think that\b/gi, "It is not quite right to say that")
      .replace(/\bI do not think\b/gi, "It is not quite right to say")
      .replace(/\bI don't think\b/gi, "It is not quite right to say")
      .replace(/\bI would argue that\b/gi, "The stronger argument is that")
      .replace(/\bI would describe that\b/gi, "The best description is that")
      .replace(/(^|[.!?]\s+)So The best description is\b/g, "$1The best description is")
      .replace(/\bI would describe\b/gi, "The best description is")
      .replace(/\bI would say that\b/gi, "It makes more sense to say that")
      .replace(/\bI would say\b/gi, "It makes more sense to say")
      .replace(/\bI think\b/gi, "It seems")
      .replace(/\bmy argument\b/gi, "the argument");
  }

  let mattersCount = 0;
  result = result.replace(/\bThat matters because\b/g, () => {
    mattersCount += 1;
    if (mattersCount <= 1) return "That matters because";
    return mattersCount % 2 === 0 ? "That helps explain why" : "That is important because";
  });

  let evenSoCount = 0;
  result = result.replace(/\bEven so,/g, () => {
    evenSoCount += 1;
    if (evenSoCount <= 1) return "Even so,";
    return "Still,";
  });

  let atSameTimeCount = 0;
  result = result.replace(/\bAt the same time,/g, () => {
    atSameTimeCount += 1;
    if (atSameTimeCount <= 1) return "At the same time,";
    return "Still,";
  });

  let standsOutCount = 0;
  result = result.replace(/\bWhat stands out is\b/g, () => {
    standsOutCount += 1;
    if (standsOutCount <= 1) return "What stands out is";
    return standsOutCount % 2 === 0 ? "What matters most is" : "More important is";
  });

  let thatIsWhyCount = 0;
  result = result.replace(/\bThat is why\b/g, () => {
    thatIsWhyCount += 1;
    if (thatIsWhyCount <= 1) return "That is why";
    return thatIsWhyCount % 2 === 0 ? "That helps explain why" : "That is one reason why";
  });

  result = result
    .replace(/\bAl-Tabari's account describes\b/gi, "Al-Tabari describes")
    .replace(/\bAl-Tabari's account emphasizes\b/gi, "Al-Tabari emphasizes")
    .replace(/\bAl-Tabari's narrative emphasizes\b/gi, "Al-Tabari emphasizes")
    .replace(/\bthe modern interpretation in the packet argues\b/gi, "a later interpretation argues")
    .replace(/\bthe best description is\b/gi, "the more accurate description is")
    .replace(/\bthe stronger argument is that\b/gi, "what matters more is that")
    .replace(/\bthe more accurate description is\b/gi, "a better way to put it is")
    .replace(/\ba better way to put it is it as\b/gi, "a better way to put it is to describe it as")
    .replace(/\bwhat stands out in that framing is\b/gi, "that framing shows")
    .replace(/\ba note in the packet on\b/gi, "a note on")
    .replace(/\bone note in the packet on\b/gi, "one note on")
    .replace(/\bone discussion in the packet of\b/gi, "one discussion of")
    .replace(/\bthe thesis\b/gi, "the main point")
    .replace(/\bthe argument\b/gi, "the point")
    .replace(/\bhistoriographical source packet\b/gi, "later interpretation");

  result = result.replace(/(^|[.!?]\s+|\n\n)([a-z])/g, (_, prefix: string, ch: string) => `${prefix}${ch.toUpperCase()}`);

  return result;
}

export function polishLevel2SurfaceVoice(essay: string, fingerprint: StyleFingerprint): string {
  let result = normalizeQuotes(essay);

  if (fingerprint.voice.contractions) {
    result = injectContractions(result, 3, 5);
  }

  result = smoothRepeatedAnalyticalTransitions(result);
  result = downgradeAiStyledPhrases(result);
  result = stripEmDashes(result);
  return result.replace(/\.{2,}/g, ".");
}

function smoothRepeatedAnalyticalTransitions(text: string): string {
  const rules: Array<{ pattern: RegExp; replacements: string[] }> = [
    { pattern: /(^|[.!?]\s+)At the same time,\s+/g, replacements: ["Still, ", "Even so, "] },
    { pattern: /(^|[.!?]\s+)In other words,\s+/g, replacements: ["So, ", "Put differently, "] },
    { pattern: /(^|[.!?]\s+)That is why\s+/g, replacements: ["So ", "That helps explain why "] },
    { pattern: /(^|[.!?]\s+)This is also why\s+/g, replacements: ["That also helps explain why ", "This also explains why "] },
  ];

  let result = text;
  for (const { pattern, replacements } of rules) {
    let seen = 0;
    result = result.replace(pattern, (match, prefix: string) => {
      seen += 1;
      if (seen <= 1) return match;
      const replacement = replacements[Math.min(seen - 2, replacements.length - 1)];
      return `${prefix}${replacement}`;
    });
  }

  return result;
}

function downgradeAiStyledPhrases(text: string): string {
  return text
    .replace(/\bcompelling narrative\b/gi, "strong account")
    .replace(/\bpolitically opportunistic\b/gi, "mostly political")
    .replace(/\bperfect record\b/gi, "complete record");
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
