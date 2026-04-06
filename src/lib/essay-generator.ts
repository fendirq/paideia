interface WritingProfile {
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

interface Sample {
  label: string;
  content: string;
}

interface GenerateOptions {
  profile: WritingProfile;
  samples: Sample[];
  assignment: string;
  wordCount: number;
  requirements?: string;
}

export function buildLevel1Prompt(opts: GenerateOptions): string {
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

export function buildLevel2StyleAnalysisPrompt(samples: Sample[]): string {
  const sampleTexts = samples
    .map((s, i) => `--- Sample ${i + 1}: ${s.label} ---\n${s.content}`)
    .join("\n\n");

  return `Analyze these writing samples and produce a detailed "style fingerprint" as JSON. Be extremely specific — cite actual phrases, patterns, and tendencies from the samples.

${sampleTexts}

Return a JSON object with these fields:
{
  "averageSentenceLength": number,
  "sentenceVariation": "low" | "medium" | "high",
  "vocabularyTier": "basic" | "moderate" | "advanced" | "inconsistent",
  "favoriteTransitions": string[],
  "commonOpeningPatterns": string[],
  "closingPatterns": string[],
  "toneDescriptors": string[],
  "grammarIssues": string[],
  "punctuationHabits": string[],
  "paragraphStructure": string,
  "analysisDepth": "surface" | "moderate" | "deep",
  "uniquePhrasings": string[],
  "repetitivePatterns": string[],
  "evidenceIntegration": string,
  "overallVoice": string
}

Return ONLY the JSON, no commentary.`;
}

export function buildLevel2GenerationPrompt(
  opts: GenerateOptions,
  styleFingerprint: string
): string {
  const { profile, assignment, wordCount, requirements } = opts;
  const { teacherProfile: tp, selfAssessment: sa, writingStyle: ws } = profile;

  return `You are an advanced writing replication engine. You have been given a detailed style fingerprint from analyzing the student's actual writing, plus their self-reported profile. Your job is to produce an essay that is indistinguishable from the student's own work.

## Style Fingerprint (from analysis of their actual writing)
${styleFingerprint}

## Student Self-Report
- Grade Level: ${tp.gradeLevel}
- Grade Range: ${sa.gradeRange}
- Effort: ${sa.effortLevel}
- Strength: ${sa.writingStrength}
- Weakness: ${sa.writingWeakness}
- Tone: ${ws.toneTraits.join(", ")}
- Sentences: ${ws.sentenceStyle.join(", ")}
- Vocabulary: ${ws.vocabularyLevel}
- Phrases: ${ws.commonPhrases}
- Quirks: ${ws.quirks}

## Teacher Context
- Focus: ${tp.focusAreas.join(", ")}
- Strictness: ${tp.strictness.join(", ")}

## Assignment
${assignment}
${requirements ? `\nRequirements: ${requirements}` : ""}

## Instructions
Write approximately ${wordCount} words. Use the style fingerprint as your PRIMARY guide — it's based on their real writing. The self-report is supplementary context.

Critical rules:
1. Match sentence length distribution from the fingerprint
2. Use their actual transition words and phrases
3. Replicate their paragraph structure
4. Include their typical grammar issues and punctuation habits
5. Match their analysis depth — do NOT exceed it
6. Use their vocabulary tier consistently
7. The essay should feel natural, not over-optimized

Write the essay now.`;
}
