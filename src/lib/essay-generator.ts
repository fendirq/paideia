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

  return `Analyze these writing samples from a student. Extract a comprehensive style fingerprint. Be EXTREMELY specific — cite actual words, phrases, and patterns directly from the text. Do not generalize.

${sampleTexts}

Return JSON with this exact structure:
{
  "sentencePatterns": {
    "averageLength": <number of words>,
    "variation": "low" | "medium" | "high",
    "tendency": "<e.g., favors compound sentences joined by 'and'>"
  },
  "vocabulary": {
    "tier": "basic" | "moderate" | "advanced" | "inconsistent",
    "signatureWords": ["<words they use often>"],
    "avoidedWords": ["<sophisticated words they never use>"],
    "wordChoicePattern": "<e.g., uses simple verbs, rarely uses adverbs>"
  },
  "transitions": {
    "favorites": ["<exact transitions from samples>"],
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

  return `Create a detailed outline for an essay that matches this student's writing patterns.

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

## Student's Self-Reported Patterns
- Evidence approach: ${evidence}
- Conclusion approach: ${conclusion}
- Weaknesses to avoid: ${losesPoints}
${timeSpent ? `- They spend the most time on: ${timeSpent} — allocate quality accordingly` : ""}

## Quality Target
Grade level: ${gradeLevel}, typical grade: ${gradeRange}
Target: ~${wordCount} words

Return a structured outline with:
1. A thesis statement that matches their voice
2. Paragraph-by-paragraph plan (topic sentence idea, evidence to include, analysis approach)
3. Follow their typical structure — do NOT impose a structure they don't naturally use
4. Note which sections should feel more polished vs rougher based on where they spend time

Return ONLY the outline, no commentary.`;
}

// ─── Level 2 Generation Prompt (uses outline + all 12 fields) ───

export function buildLevel2GenerationPrompt(opts: GenerateOptions, outline: string): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, samples, assignment, wordCount, requirements } = opts;

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

  // Level 2 enhanced fields
  const quoteIntros = formatList(sa.quoteIntroStyle ?? [], sa.quoteIntroOther);
  const overused = formatList(sa.overusedPhrases ?? [], sa.overusedPhrasesOther);
  const selfEdit = formatList(sa.selfEditFocus ?? [], sa.selfEditOther);
  const timeSpent = resolveValue(sa.timeSpentOn ?? "", sa.timeSpentOther ?? "");

  return `You are replicating a specific student's writing voice with extreme precision. Follow the outline below exactly. Each paragraph must use vocabulary, transitions, and sentence patterns from the fingerprint.

## Outline (follow this structure)
${outline}

## Style Fingerprint
${JSON.stringify(fingerprint, null, 2)}

## Reference Samples
${refSamples}

## Student Context (Base Profile)
- Grade level: ${gradeLevel}, typically earns ${gradeRange}
- Revision habit: ${revision}
- Evidence approach: ${evidence}
- Conclusion approach: ${conclusion}
- Word count tendency: ${wordCountTendency}
- Known weaknesses: ${losesPoints}
- Writing habits to replicate: ${habits}

## Enhanced Voice Profile (Level 2)
- QUOTE INTRODUCTIONS: When integrating quotes, this student uses these exact patterns: ${quoteIntros}. You MUST use these phrasings — they are a strong voice marker.
- OVERUSED WORDS/PHRASES: This student naturally overuses: ${overused}. Weave these in at a realistic frequency (not every paragraph, but noticeably present). These are part of their voice — don't eliminate them.
- SELF-EDITING PATTERNS: When this student rereads, they fix: ${selfEdit}. This means OTHER types of errors survive into their final draft. Let those survive.
${timeSpent ? `- TIME DISTRIBUTION: They spend the most effort on "${timeSpent}". That section should feel more polished. Other sections should feel comparatively rougher.` : ""}

## Assignment
${assignment}
${requirements ? `\nRubric/Requirements:\n${requirements}` : ""}

## Critical Rules
1. VOCABULARY: Use words from "signatureWords". NEVER use "avoidedWords". Stay in tier: ${fingerprint.vocabulary.tier}.
2. SENTENCES: Average ~${fingerprint.sentencePatterns.averageLength} words. Variation: ${fingerprint.sentencePatterns.variation}. Tendency: ${fingerprint.sentencePatterns.tendency}.
3. TRANSITIONS: ONLY from "favorites": ${fingerprint.transitions.favorites.join(", ")}. NEVER: ${fingerprint.transitions.neverUses.join(", ")}.
4. EVIDENCE: Method: ${fingerprint.evidenceStyle.method}. Pattern: ${fingerprint.evidenceStyle.analysisPattern}. Self-reported: "${evidence}".
5. QUOTE INTEGRATION: Use ONLY these intro patterns: ${quoteIntros}. This is critical for voice matching.
6. ERRORS: Include naturally: ${fingerprint.errors.grammarPatterns.join(", ")}. Punctuation: ${fingerprint.errors.punctuationHabits.join(", ")}. The student fixes ${selfEdit} when self-editing — let other error types persist.
7. VOICE: ${fingerprint.voice.toneDescription}. ${fingerprint.voice.contractions ? "Uses contractions." : "No contractions."} ${fingerprint.voice.perspective === "first-person" ? "First person." : fingerprint.voice.perspective === "third-person" ? "Third person." : "Mixed perspectives."}
8. POLISH LEVEL: Revision style is "${revision}". Calibrate the draft feel accordingly.
9. QUALITY CEILING: ${gradeRange} level. Not higher.
10. TARGET: ~${wordCount} words. Student tendency: ${wordCountTendency}.

Write the essay now, following the outline.`;
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
