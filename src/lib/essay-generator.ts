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
  teacherPriorities: string[];
  teacherPenalizes: string;
  formattingRules: string[];
}

export interface SelfAssessment {
  gradeRange: string;
  writingApproach: string;
  voiceDescription: string;
  additionalNotes: string;
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

// ─── Level 1 Prompt (fingerprint-first) ───

export function buildLevel1Prompt(opts: GenerateOptions): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, samples, assignment, wordCount, requirements } = opts;

  // Include 2 shortest samples as inline reference
  const sortedSamples = [...samples].sort((a, b) => a.content.length - b.content.length);
  const refSamples = sortedSamples.slice(0, 2)
    .map((s, i) => `--- Reference ${i + 1}: ${s.label} ---\n${s.content}`)
    .join("\n\n");

  return `You are replicating a specific student's writing voice. You have their analyzed style fingerprint and reference samples below. Your job is NOT to write a good essay — it's to write an essay this student would actually produce.

## Style Fingerprint (extracted from their real writing)
${JSON.stringify(fingerprint, null, 2)}

## Reference Samples (read these to internalize their voice)
${refSamples}

## Student Context
- Grade: ${tp.gradeLevel}, typically earns ${sa.gradeRange}
- Writing approach: ${sa.writingApproach}
- How they describe their own voice: "${sa.voiceDescription}"
${sa.additionalNotes ? `- Additional: ${sa.additionalNotes}` : ""}

## Teacher Context
- Prioritizes: ${tp.teacherPriorities.join(", ")}
- Marks down for: ${tp.teacherPenalizes}
- Format rules: ${tp.formattingRules.join(", ")}

## Assignment
${assignment}
${requirements ? `\nRubric/Requirements:\n${requirements}` : ""}

## Critical Rules
1. VOCABULARY: Use words from the "signatureWords" list. NEVER use words from "avoidedWords". Stay within their vocabulary tier (${fingerprint.vocabulary.tier}).
2. SENTENCES: Match their average sentence length (~${fingerprint.sentencePatterns.averageLength} words). Replicate their sentence variation pattern (${fingerprint.sentencePatterns.variation}).
3. TRANSITIONS: ONLY use transitions from their "favorites" list. NEVER use transitions from their "neverUses" list.
4. STRUCTURE: Follow their intro/body/conclusion patterns from the fingerprint.
5. EVIDENCE: Use their evidence integration method: ${fingerprint.evidenceStyle.method}. Match their analysis depth: ${fingerprint.evidenceStyle.analysisDepth}.
6. ERRORS: Include their documented grammar patterns naturally. Do NOT add errors they don't make.
7. VOICE: ${fingerprint.voice.toneDescription}. ${fingerprint.voice.contractions ? "They use contractions." : "They avoid contractions."} ${fingerprint.voice.perspective === "first-person" ? "They write in first person." : fingerprint.voice.perspective === "third-person" ? "They avoid first person." : "They mix perspectives."}
8. QUALITY CEILING: This should read like a ${sa.gradeRange} essay, not higher.
9. TARGET: ~${wordCount} words.

Write the essay now.`;
}

// ─── Level 2 Outline Prompt ───

export function buildLevel2OutlinePrompt(opts: GenerateOptions): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, assignment, wordCount, requirements } = opts;

  return `Create a detailed outline for an essay that matches this student's writing patterns.

## Assignment
${assignment}
${requirements ? `\nRubric/Requirements:\n${requirements}` : ""}

## Student's Structural Patterns
- Intro pattern: ${fingerprint.structure.introPattern}
- Body paragraph pattern: ${fingerprint.structure.bodyParagraphPattern}
- Conclusion pattern: ${fingerprint.structure.conclusionPattern}
- Avg paragraph length: ${fingerprint.structure.avgParagraphLength} sentences
- Thesis placement: ${fingerprint.structure.thesisPlacement}
- Evidence method: ${fingerprint.evidenceStyle.method}
- Analysis depth: ${fingerprint.evidenceStyle.analysisDepth}

## Teacher Priorities
${tp.teacherPriorities.join(", ")}

## Quality Target
Grade level: ${tp.gradeLevel}, typical grade: ${sa.gradeRange}
Target: ~${wordCount} words

Return a structured outline with:
1. A thesis statement that matches their voice
2. Paragraph-by-paragraph plan (topic sentence idea, evidence to include, analysis approach)
3. Follow their typical structure — do NOT impose a structure they don't naturally use

Return ONLY the outline, no commentary.`;
}

// ─── Level 2 Generation Prompt (uses outline) ───

export function buildLevel2GenerationPrompt(opts: GenerateOptions, outline: string): string {
  const { teacherProfile: tp, selfAssessment: sa, fingerprint, samples, assignment, wordCount, requirements } = opts;

  const sortedSamples = [...samples].sort((a, b) => a.content.length - b.content.length);
  const refSamples = sortedSamples.slice(0, 2)
    .map((s, i) => `--- Reference ${i + 1}: ${s.label} ---\n${s.content}`)
    .join("\n\n");

  return `You are replicating a specific student's writing voice. Follow the outline below exactly. Each paragraph must use vocabulary, transitions, and sentence patterns from the fingerprint.

## Outline (follow this structure)
${outline}

## Style Fingerprint
${JSON.stringify(fingerprint, null, 2)}

## Reference Samples
${refSamples}

## Student Context
- Grade: ${tp.gradeLevel}, typically earns ${sa.gradeRange}
- Writing approach: ${sa.writingApproach}
- How they describe their own voice: "${sa.voiceDescription}"
${sa.additionalNotes ? `- Additional: ${sa.additionalNotes}` : ""}

## Teacher Context
- Prioritizes: ${tp.teacherPriorities.join(", ")}
- Marks down for: ${tp.teacherPenalizes}
- Format rules: ${tp.formattingRules.join(", ")}

## Assignment
${assignment}
${requirements ? `\nRubric/Requirements:\n${requirements}` : ""}

## Critical Rules
1. VOCABULARY: Use words from "signatureWords". NEVER use "avoidedWords". Stay in tier: ${fingerprint.vocabulary.tier}.
2. SENTENCES: Average ~${fingerprint.sentencePatterns.averageLength} words. Variation: ${fingerprint.sentencePatterns.variation}. Tendency: ${fingerprint.sentencePatterns.tendency}.
3. TRANSITIONS: ONLY from "favorites": ${fingerprint.transitions.favorites.join(", ")}. NEVER: ${fingerprint.transitions.neverUses.join(", ")}.
4. EVIDENCE: Method: ${fingerprint.evidenceStyle.method}. Pattern: ${fingerprint.evidenceStyle.analysisPattern}.
5. ERRORS: Include naturally: ${fingerprint.errors.grammarPatterns.join(", ")}. Punctuation: ${fingerprint.errors.punctuationHabits.join(", ")}.
6. VOICE: ${fingerprint.voice.toneDescription}. ${fingerprint.voice.contractions ? "Uses contractions." : "No contractions."} ${fingerprint.voice.perspective === "first-person" ? "First person." : fingerprint.voice.perspective === "third-person" ? "Third person." : "Mixed perspectives."}
7. QUALITY CEILING: ${sa.gradeRange} level. Not higher.
8. TARGET: ~${wordCount} words.

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
