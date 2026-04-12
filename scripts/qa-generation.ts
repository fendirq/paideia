import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildStyleAnalysisPrompt,
  buildLevel1Prompt,
  buildLevel2PlanPrompt,
  buildLevel2WritingPrompt,
  buildLevel2CritiquePrompt,
  buildLevel2AuditPrompt,
  buildLevel2ExpansionPrompt,
  buildLevel2EvidenceIntegrationPrompt,
  buildLevel2AttributionPrompt,
  buildLevel2CompliancePrompt,
  buildLevel2SourceFlowPrompt,
  buildLevel2TrimPrompt,
  normalizeSupportedSourceAttribution,
  normalizeFingerprint,
  polishLevel2SurfaceVoice,
  sanitizeEssayOutput,
  stripUnsupportedSourceAttribution,
  type GenerateOptions,
  type SelfAssessment,
  type StyleFingerprint,
  type TeacherProfile,
} from "../src/lib/essay-generator.ts";
import { inferRequiredEvidenceCount, inferWordCountBounds } from "../src/lib/source-context.ts";

const ROOT = process.cwd();
const QA_DOC_DIR = path.join(ROOT, "output", "doc", "qa-level2");
const QA_FIXTURE_DIR = path.join(ROOT, "scripts", "fixtures", "qa");
const DEFAULT_QA_OUTPUT_DIR = path.join(ROOT, "output", "qa", "generation");
const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";
const LEVEL1_MODEL = "deepseek-ai/DeepSeek-V3";
const LEVEL2_PRIMARY_MODEL =
  process.env.ANTHROPIC_LEVEL2_PRIMARY_MODEL ||
  process.env.ANTHROPIC_MODEL ||
  "claude-opus-4-6";
const LEVEL2_FALLBACK_MODEL =
  process.env.ANTHROPIC_LEVEL2_FALLBACK_MODEL ||
  "claude-sonnet-4-6";

interface SampleInput {
  label: string;
  content: string;
  wordCount: number;
}

interface EssayMetrics {
  wordCount: number;
  paragraphCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  sentenceStdDev: number;
  contractionCount: number;
  emDashCount: number;
  theOpenerPct: number;
  maxRepeatedOpenerRun: number;
  aiPhraseHits: string[];
  favoriteTransitionHits: string[];
  forbiddenTransitionHits: string[];
  signatureWordHits: string[];
  avoidedWordHits: string[];
}

interface JudgeScores {
  aiDetectionResistance: number;
  sampleAccuracy: number;
  rubricAccuracy: number;
  evidenceHandling: number;
  overallWriting: number;
  overallVerdict: string;
  strengths: string[];
  weaknesses: string[];
  priorityFixes: string[];
}

interface ScenarioConfig {
  name: string;
  assignment: string;
  rubric: string;
  samples: SampleInput[];
  teacherProfile: TeacherProfile;
  selfAssessment: SelfAssessment;
  targetWordCount: number;
  sourceContext: string;
  outputDir: string;
  summaryLines: string[];
}

interface FixtureMeta {
  label: string;
  targetWordCount: number;
  teacherProfile: TeacherProfile;
  selfAssessment: SelfAssessment;
}

function ensureOutputDir(outputDir: string) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function readDocxText(filename: string): string {
  return execFileSync("textutil", ["-convert", "txt", "-stdout", path.join(QA_DOC_DIR, filename)], {
    encoding: "utf8",
  }).trim();
}

function readTextFile(filename: string): string {
  return fs.readFileSync(filename, "utf8").trim();
}

function loadDefaultScenario(): ScenarioConfig {
  const assignment = readDocxText("assignment-abbasid-essay.docx");
  const rubric = readDocxText("rubric-abbasid-essay.docx");
  const samples: SampleInput[] = [
    "sample-1-revolution.docx",
    "sample-2-primary-source.docx",
    "sample-3-comparison.docx",
    "sample-4-short-answer.docx",
  ].map((filename, index) => {
    const content = readDocxText(filename);
    return {
      label: `Sample ${index + 1}`,
      content,
      wordCount: countWords(content),
    };
  });

  const teacherProfile: TeacherProfile = {
    gradeLevel: "11th grade",
    gradeOther: "",
    losesPointsFor: ["weak thesis", "general statements", "not enough explanation after quotes"],
    losesPointsOther: "",
  };

  const selfAssessment: SelfAssessment = {
    gradeRange: "B",
    gradeRangeOther: "",
    revisionLevel: "I reread and fix obvious errors",
    revisionOther: "",
    evidenceApproach: "I find a quote and explain it",
    evidenceOther: "",
    conclusionApproach: "I restate my thesis in different words",
    conclusionOther: "",
    wordCountTendency: "I usually write slightly under the target",
    wordCountOther: "",
    writingHabits: ["I overuse transition words", "I repeat myself in conclusions"],
    writingHabitsOther: "",
    quoteIntroStyle: ["As the source says", "The text shows"],
    quoteIntroOther: "",
    overusedPhrases: ["this shows that", "this matters because"],
    overusedPhrasesOther: "",
    selfEditFocus: ["spelling mistakes", "awkward wording"],
    selfEditOther: "",
    timeSpentOn: "body paragraphs",
    timeSpentOther: "",
  };

  const sourceContext = [
    "APPROVED SOURCE MATERIAL:",
    "--- Source 1: Abbasid Revolution notes ---",
    "- The Abbasid movement drew major support from mawali and from Khorasan.",
    "- Abu Muslim helped organize support in Khorasan.",
    "- The Abbasids defeated the Umayyads at the Battle of the Zab in 750.",
    "- The Abbasids claimed descent from al-Abbas, the Prophet's uncle.",
    "- After taking power, they moved the capital to Baghdad and relied more on Persian officials.",
    "- Baghdad became a center of trade, learning, and administration.",
  ].join("\n");

  return {
    name: "default",
    assignment,
    rubric,
    samples,
    teacherProfile,
    selfAssessment,
    targetWordCount: 780,
    sourceContext,
    outputDir: DEFAULT_QA_OUTPUT_DIR,
    summaryLines: [
      "Assignment corpus: Abbasid essay prompt + rubric from `output/doc/qa-level2/`.",
      "Student corpus: 4 repo-hosted sample essays from the same folder.",
      "Target word count: 780.",
    ],
  };
}

function loadFixtureScenario(name: string): ScenarioConfig {
  const scenarioDir = path.join(QA_FIXTURE_DIR, name);
  if (!fs.existsSync(scenarioDir)) {
    throw new Error(`Unknown QA scenario: ${name}`);
  }

  const meta = JSON.parse(readTextFile(path.join(scenarioDir, "meta.json"))) as FixtureMeta;
  const assignment = readTextFile(path.join(scenarioDir, "assignment.txt"));
  const rubric = readTextFile(path.join(scenarioDir, "rubric.txt"));
  const sourceContext = readTextFile(path.join(scenarioDir, "source-context.txt"));

  const sampleFiles = fs.readdirSync(scenarioDir)
    .filter((file) => /^sample-\d+\.txt$/.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const samples: SampleInput[] = sampleFiles.map((file, index) => {
    const content = readTextFile(path.join(scenarioDir, file));
    return {
      label: `Sample ${index + 1}`,
      content,
      wordCount: countWords(content),
    };
  });

  return {
    name,
    assignment,
    rubric,
    samples,
    teacherProfile: meta.teacherProfile,
    selfAssessment: meta.selfAssessment,
    targetWordCount: meta.targetWordCount,
    sourceContext,
    outputDir: path.join(ROOT, "output", "qa", name),
    summaryLines: [
      `Scenario: \`${meta.label}\` fixture set from [scripts/fixtures/qa/${name}](/Users/kingtom91/Documents/Projects/Paideia/scripts/fixtures/qa/${name}).`,
      `Assignment corpus: \`assignment.txt\` + \`rubric.txt\` from the fixture directory.`,
      `Student corpus: ${samples.length} college-standard sample essays from the fixture directory.`,
      `Target word count: ${meta.targetWordCount}.`,
    ],
  };
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countParagraphs(text: string): number {
  return text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean).length;
}

function passesRevisionLengthFloor(text: string, targetWordCount: number, currentEssay: string): boolean {
  const revisedWords = countWords(text);
  const currentWords = countWords(currentEssay);
  return revisedWords >= Math.max(Math.floor(targetWordCount * 0.7), currentWords - 120);
}

function isWithinMaxWords(text: string, maxWords: number | null): boolean {
  return maxWords == null || countWords(text) <= maxWords;
}

function needsSourceFlowPass(text: string): boolean {
  const phrasePatterns = [
    /\baccording to the source\b/gi,
    /\baccording to the sources\b/gi,
    /\baccording to the source packet\b/gi,
    /\bthis shows\b/gi,
    /\bthat matters because\b/gi,
    /\bin other words\b/gi,
  ];

  return phrasePatterns.some((pattern) => {
    const matches = text.match(pattern) ?? [];
    return matches.length >= 2;
  });
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function sentenceStats(sentences: string[]) {
  const lengths = sentences.map((sentence) => countWords(sentence));
  const avg = lengths.reduce((sum, length) => sum + length, 0) / Math.max(lengths.length, 1);
  const variance =
    lengths.reduce((sum, length) => sum + (length - avg) ** 2, 0) / Math.max(lengths.length, 1);
  return { avg, stdDev: Math.sqrt(variance), lengths };
}

function uniqueHits(text: string, terms: string[]): string[] {
  const lower = text.toLowerCase();
  return terms.filter((term) => lower.includes(term.toLowerCase()));
}

function analyzeEssay(essay: string, fingerprint: StyleFingerprint): EssayMetrics {
  const paragraphs = essay.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const sentences = splitSentences(essay);
  const { avg, stdDev } = sentenceStats(sentences);
  const openers = sentences
    .map((sentence) => sentence.match(/^\s*["'(]*([A-Za-z]+)/)?.[1]?.toLowerCase() ?? "")
    .filter(Boolean);

  let maxRepeatedOpenerRun = 1;
  let currentRun = 1;
  for (let i = 1; i < openers.length; i++) {
    if (openers[i] === openers[i - 1]) {
      currentRun++;
      maxRepeatedOpenerRun = Math.max(maxRepeatedOpenerRun, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const aiPhrases = [
    "delve into",
    "it's important to note",
    "in today's society",
    "furthermore",
    "multifaceted",
    "nuanced",
    "pivotal",
    "underscores",
    "highlights the importance of",
    "plays a crucial role",
    "serves as a testament",
    "serves as a powerful",
    "compelling narrative",
  ];
  const contractions =
    essay.match(/\b(?:doesn't|don't|can't|isn't|it's|that's|won't|wasn't|weren't|didn't|hasn't|haven't|they're|wouldn't|couldn't|shouldn't)\b/gi) ??
    [];

  return {
    wordCount: countWords(essay),
    paragraphCount: paragraphs.length,
    sentenceCount: sentences.length,
    avgSentenceLength: Number(avg.toFixed(2)),
    sentenceStdDev: Number(stdDev.toFixed(2)),
    contractionCount: contractions.length,
    emDashCount: (essay.match(/—/g) ?? []).length,
    theOpenerPct: Number(
      ((openers.filter((opener) => opener === "the").length / Math.max(openers.length, 1)) * 100).toFixed(1)
    ),
    maxRepeatedOpenerRun,
    aiPhraseHits: uniqueHits(essay, aiPhrases),
    favoriteTransitionHits: uniqueHits(essay, fingerprint.transitions.favorites),
    forbiddenTransitionHits: uniqueHits(essay, fingerprint.transitions.neverUses),
    signatureWordHits: uniqueHits(essay, fingerprint.vocabulary.signatureWords),
    avoidedWordHits: uniqueHits(essay, fingerprint.vocabulary.avoidedWords),
  };
}

function heuristicGrade(metrics: EssayMetrics, fingerprint: StyleFingerprint, targetWordCount: number) {
  let aiDetectionResistance = 10;
  let authenticity = 10;

  if (metrics.sentenceStdDev < 6.5) aiDetectionResistance -= 3;
  else if (metrics.sentenceStdDev < 7.5) aiDetectionResistance -= 1;
  if (metrics.aiPhraseHits.length > 0) aiDetectionResistance -= Math.min(3, metrics.aiPhraseHits.length);
  if (metrics.maxRepeatedOpenerRun >= 3) aiDetectionResistance -= 1;
  if (metrics.theOpenerPct > 45) aiDetectionResistance -= 1;
  if (fingerprint.voice.contractions && metrics.contractionCount < 3) aiDetectionResistance -= 2;
  if (metrics.emDashCount > 0) aiDetectionResistance -= 1;

  const wordCountDrift = Math.abs(metrics.wordCount - targetWordCount);
  if (wordCountDrift > targetWordCount * 0.2) authenticity -= 1;
  if (metrics.forbiddenTransitionHits.length > 0) authenticity -= 2;
  if (metrics.avoidedWordHits.length > 0) authenticity -= 2;
  if (metrics.signatureWordHits.length < Math.min(3, fingerprint.vocabulary.signatureWords.length)) authenticity -= 1;
  if (fingerprint.voice.contractions && metrics.contractionCount < 4) authenticity -= 1;
  if (!fingerprint.voice.contractions && metrics.contractionCount > 0) authenticity -= 2;

  return {
    aiDetectionResistance: Math.max(1, Math.min(10, aiDetectionResistance)),
    authenticity: Math.max(1, Math.min(10, authenticity)),
  };
}

function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Could not find JSON object in judge response");
  }
  return text.slice(start, end + 1);
}

async function callTogether(prompt: string): Promise<string> {
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error("TOGETHER_API_KEY is not configured");
  }

  const response = await fetch(TOGETHER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LEVEL1_MODEL,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "Write the essay now." },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Together request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return sanitizeEssayOutput(data.choices?.[0]?.message?.content ?? "");
}

function shouldUseAdaptiveThinking(model: string): boolean {
  return model.startsWith("claude-opus-4-6") || model.startsWith("claude-sonnet-4-6");
}

async function createLevel2Message(
  anthropic: Anthropic,
  {
    prompt,
    system,
    maxTokens,
    temperature,
    thinking,
  }: {
    prompt: string;
    system: string;
    maxTokens: number;
    temperature?: number;
    thinking?: { type: "adaptive"; display?: "summarized" | "omitted" };
  }
) {
  const models = [LEVEL2_PRIMARY_MODEL];
  if (LEVEL2_FALLBACK_MODEL && LEVEL2_FALLBACK_MODEL !== LEVEL2_PRIMARY_MODEL) {
    models.push(LEVEL2_FALLBACK_MODEL);
  }

  let lastError: unknown;
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const useThinking = Boolean(thinking && shouldUseAdaptiveThinking(model));
      return await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        ...(!useThinking && temperature !== undefined ? { temperature } : {}),
        system,
        messages: [{ role: "user", content: prompt }],
        ...(useThinking ? { thinking } : {}),
      });
    } catch (error) {
      lastError = error;
      if (i === models.length - 1) throw error;
    }
  }

  throw lastError;
}

function extractAnthropicText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

async function analyzeStyle(samples: SampleInput[]): Promise<StyleFingerprint> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = buildStyleAnalysisPrompt(samples.map(({ label, content }) => ({ label, content })));
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    temperature: 0.2,
    system: "You are a forensic writing analyst. Extract granular patterns from student writing samples. Every claim must cite specific words, phrases, or patterns directly from the text. Return only valid JSON.",
    messages: [{ role: "user", content: prompt }],
  });

  const content = extractAnthropicText(response)
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return normalizeFingerprint(JSON.parse(content) as Record<string, unknown>);
}

async function generateLevel2Essay(opts: GenerateOptions): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const outline = sanitizeEssayOutput(
    extractAnthropicText(
      await createLevel2Message(anthropic, {
        prompt: buildLevel2PlanPrompt(opts),
        system: "You are an essay planning assistant. Create a concise structural outline for the assignment.",
        maxTokens: 2048,
        temperature: 0.25,
        thinking: { type: "adaptive", display: "omitted" },
      })
    )
  );

  const draft = sanitizeEssayOutput(
    extractAnthropicText(
      await createLevel2Message(anthropic, {
        prompt: buildLevel2WritingPrompt(opts, outline),
        system: `You are ghostwriting in the student's recognizable voice, but at a polished A-range quality floor. Match the student's style signatures without reproducing weak grammar or underdeveloped reasoning.${opts.sourceContext ? " Use the approved source material directly." : " Without a source packet, keep the factual specificity at the level of a well-prepared student rather than a textbook or historian."}`,
        maxTokens: 5000,
        temperature: 0.55,
      })
    )
  );

  let critiqueNotes = "";
  try {
    const critique = sanitizeEssayOutput(
      extractAnthropicText(
        await createLevel2Message(anthropic, {
          prompt: buildLevel2CritiquePrompt(draft, opts.fingerprint, opts.samples, opts.sourceContext),
          system: "You are a writing-forensics critic. Diagnose where a generated essay fails to match a student's real writing, prioritizing the highest-risk AI tells and voice mismatches.",
          maxTokens: 2500,
          temperature: 0.1,
          thinking: { type: "adaptive", display: "omitted" },
        })
      )
    );
    if (/VERDICT:/i.test(critique) && /PRIORITY FIXES:/i.test(critique)) {
      critiqueNotes = critique;
    }
  } catch {
    critiqueNotes = "";
  }

  let revised = "";
  try {
    revised = sanitizeEssayOutput(
      extractAnthropicText(
        await createLevel2Message(anthropic, {
          prompt: buildLevel2AuditPrompt(draft, opts.fingerprint, opts.samples, critiqueNotes, opts.sourceContext),
          system: `You are a writing forensics expert. Rewrite the essay so a teacher who knows the student's real work would believe they wrote it. Preserve the student's recognizable voice, but make the essay polished, coherent, well-supported, and strong enough to satisfy an A-range assignment standard.${opts.sourceContext ? " Ground the essay in the approved sources." : " Keep no-source essays concrete, but do not let them drift into textbook-level precision."}`,
          maxTokens: 5000,
          temperature: 0.2,
        })
      )
    );
  } catch {
    revised = "";
  }

  let baseEssay = revised || draft;
  if (countWords(baseEssay) < Math.floor(opts.wordCount * 0.85) || /\b(in class|in the sources|we learned that|history shows|the text says)\b/i.test(baseEssay)) {
    try {
      const expanded = sanitizeEssayOutput(
        extractAnthropicText(
          await createLevel2Message(anthropic, {
            prompt: buildLevel2ExpansionPrompt(baseEssay, opts, critiqueNotes),
            system: "You are extending a student's essay without changing who they sound like. Keep the same argument and voice, but make the draft feel complete and concrete.",
            maxTokens: 5000,
            temperature: 0.25,
          })
        )
      );
      if (countWords(expanded) >= countWords(baseEssay)) {
        baseEssay = expanded;
      }
    } catch {
      baseEssay = revised || draft;
    }
  }

  const requirementText = `${opts.assignment}\n${opts.requirements ?? ""}`;
  const requiredEvidenceCount = inferRequiredEvidenceCount(requirementText);
  try {
    const evidencePass = sanitizeEssayOutput(
      extractAnthropicText(
        await createLevel2Message(anthropic, {
          prompt: buildLevel2EvidenceIntegrationPrompt(baseEssay, opts, {
            requiredEvidenceCount,
          }),
          system: `You are strengthening the evidence and analysis in a student-voice essay. Preserve the voice, but make every paragraph concrete and clearly explained.${opts.sourceContext ? " Use the approved source material directly when improving support." : " Without sources, keep the details plausible for a prepared student and avoid historian-level precision."}`,
          maxTokens: 5000,
          temperature: 0.15,
        })
      )
    );
    if (passesRevisionLengthFloor(evidencePass, opts.wordCount, baseEssay)) {
      baseEssay = evidencePass;
    }
  } catch {
    baseEssay = revised || draft;
  }

  const bounds = inferWordCountBounds(requirementText);
  if (opts.sourceContext || bounds.max) {
    try {
      const attribution = sanitizeEssayOutput(
        extractAnthropicText(
          await createLevel2Message(anthropic, {
            prompt: buildLevel2AttributionPrompt(baseEssay, opts, {
              maxWords: bounds.max,
            }),
            system: "You are making source use explicit in a student-voice essay. Preserve the essay's strength, but make the evidence feel clearly grounded and trim excess length if needed.",
            maxTokens: 5000,
            temperature: 0.12,
          })
        )
      );
      if (countWords(attribution) > 0) {
        baseEssay = attribution;
      }
    } catch {
      baseEssay = revised || draft;
    }
  }

  try {
    const compliance = sanitizeEssayOutput(
      extractAnthropicText(
        await createLevel2Message(anthropic, {
          prompt: buildLevel2CompliancePrompt(baseEssay, opts, {
            minWords: bounds.min,
            maxWords: bounds.max,
          }),
          system: `You are fixing assignment compliance issues in a student-voice essay. Preserve the voice, but make the essay clearly satisfy the prompt and rubric.${opts.sourceContext ? " Keep the evidence tied to the approved sources." : " Keep the evidence student-plausible instead of textbook-like."}`,
          maxTokens: 5000,
          temperature: 0.15,
        })
      )
    );
    if (countWords(compliance) >= Math.min(countWords(baseEssay), bounds.min ?? countWords(baseEssay))) {
      baseEssay = compliance;
    }
  } catch {
    baseEssay = revised || draft;
  }

  if (bounds.max && countWords(baseEssay) > bounds.max) {
    try {
      const trimmed = sanitizeEssayOutput(
        extractAnthropicText(
          await createLevel2Message(anthropic, {
            prompt: buildLevel2TrimPrompt(baseEssay, opts, {
              maxWords: bounds.max,
            }),
            system: "You are trimming a student-voice essay to fit a hard word-count ceiling. Preserve the argument and evidence, but cut repetition and excess explanation.",
            maxTokens: 5000,
            temperature: 0.1,
          })
        )
      );
      if (
        passesRevisionLengthFloor(trimmed, opts.wordCount, baseEssay) &&
        (isWithinMaxWords(trimmed, bounds.max) || countWords(trimmed) < countWords(baseEssay))
      ) {
        baseEssay = trimmed;
      }
    } catch {
      baseEssay = baseEssay;
    }
  }

  if (opts.sourceContext && needsSourceFlowPass(baseEssay)) {
    try {
      const flowed = sanitizeEssayOutput(
        extractAnthropicText(
          await createLevel2Message(anthropic, {
            prompt: buildLevel2SourceFlowPrompt(baseEssay, opts, {
              maxWords: bounds.max,
            }),
            system: "You are smoothing source integration in a student-voice essay. Preserve the argument and paragraph structure, but make attributions and repeated analytical phrases feel more natural.",
            maxTokens: 5000,
            temperature: 0.1,
          })
        )
      );
      if (
        passesRevisionLengthFloor(flowed, opts.wordCount, baseEssay) &&
        countParagraphs(flowed) === countParagraphs(baseEssay) &&
        isWithinMaxWords(flowed, bounds.max)
      ) {
        baseEssay = flowed;
      }
    } catch {
      baseEssay = baseEssay;
    }
  }

  baseEssay = opts.sourceContext
    ? normalizeSupportedSourceAttribution(baseEssay, opts.sourceContext)
    : stripUnsupportedSourceAttribution(baseEssay);

  return sanitizeEssayOutput(polishLevel2SurfaceVoice(baseEssay, opts.fingerprint));
}

async function judgeEssay(
  anthropic: Anthropic,
  {
    levelLabel,
    assignment,
    rubric,
    samples,
    essay,
    metrics,
    heuristic,
  }: {
    levelLabel: string;
    assignment: string;
    rubric: string;
    samples: SampleInput[];
    essay: string;
    metrics: EssayMetrics;
    heuristic: { aiDetectionResistance: number; authenticity: number };
  }
): Promise<JudgeScores> {
  const prompt = `You are QA grading an AI-generated student essay against real student writing samples.

ASSIGNMENT:
${assignment}

RUBRIC:
${rubric}

REAL STUDENT WRITING SAMPLES:
${samples.map((sample) => `--- ${sample.label} ---\n${sample.content}`).join("\n\n")}

GENERATED ESSAY (${levelLabel}):
${essay}

DETERMINISTIC METRICS:
${JSON.stringify({ metrics, heuristic }, null, 2)}

Grade the generated essay from 1-10 in these categories:
- aiDetectionResistance: 10 means unlikely to be flagged as AI, 1 means extremely likely
- sampleAccuracy: how closely it sounds like the student's real writing
- rubricAccuracy: how well it answers the prompt and rubric
- evidenceHandling: how well it uses and explains evidence
- overallWriting: overall quality at the student's actual level

Return valid JSON only:
{
  "aiDetectionResistance": number,
  "sampleAccuracy": number,
  "rubricAccuracy": number,
  "evidenceHandling": number,
  "overallWriting": number,
  "overallVerdict": "short paragraph",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "priorityFixes": ["..."]
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    temperature: 0.1,
    system: "You are a strict QA reviewer for student-voice essay generation. Be candid and concrete. Return only valid JSON.",
    messages: [{ role: "user", content: prompt }],
  });

  return JSON.parse(extractJsonObject(extractAnthropicText(response))) as JudgeScores;
}

function markdownSection(title: string, body: string): string {
  return `## ${title}\n\n${body}\n`;
}

async function main() {
  const scenarioName = process.env.QA_SCENARIO || process.argv[2] || "default";
  const scenario = scenarioName === "default" ? loadDefaultScenario() : loadFixtureScenario(scenarioName);
  ensureOutputDir(scenario.outputDir);

  console.log("Analyzing writing samples...");
  const fingerprint = await analyzeStyle(scenario.samples);

  const opts: GenerateOptions = {
    teacherProfile: scenario.teacherProfile,
    selfAssessment: scenario.selfAssessment,
    fingerprint,
    samples: scenario.samples.map(({ label, content }) => ({ label, content })),
    assignment: scenario.assignment,
    wordCount: scenario.targetWordCount,
    requirements: scenario.rubric,
  };

  const sourceGroundedOpts: GenerateOptions = {
    ...opts,
    sourceContext: scenario.sourceContext,
  };

  console.log("Generating Level 1 essay...");
  const level1Essay = await callTogether(buildLevel1Prompt(opts));

  console.log("Generating Level 2 essay...");
  const level2Essay = await generateLevel2Essay(opts);

  console.log("Generating Level 2 essay with sources...");
  const level2SourcedEssay = await generateLevel2Essay(sourceGroundedOpts);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const level1Metrics = analyzeEssay(level1Essay, fingerprint);
  const level2Metrics = analyzeEssay(level2Essay, fingerprint);
  const level2SourcedMetrics = analyzeEssay(level2SourcedEssay, fingerprint);
  const level1Heuristic = heuristicGrade(level1Metrics, fingerprint, opts.wordCount);
  const level2Heuristic = heuristicGrade(level2Metrics, fingerprint, opts.wordCount);
  const level2SourcedHeuristic = heuristicGrade(level2SourcedMetrics, fingerprint, opts.wordCount);

  console.log("Judging outputs...");
  const [level1Judge, level2Judge, level2SourcedJudge] = await Promise.all([
    judgeEssay(anthropic, {
      levelLabel: "Level 1",
      assignment: scenario.assignment,
      rubric: scenario.rubric,
      samples: scenario.samples,
      essay: level1Essay,
      metrics: level1Metrics,
      heuristic: level1Heuristic,
    }),
    judgeEssay(anthropic, {
      levelLabel: "Level 2",
      assignment: scenario.assignment,
      rubric: scenario.rubric,
      samples: scenario.samples,
      essay: level2Essay,
      metrics: level2Metrics,
      heuristic: level2Heuristic,
    }),
    judgeEssay(anthropic, {
      levelLabel: "Level 2 + Sources",
      assignment: scenario.assignment,
      rubric: scenario.rubric,
      samples: scenario.samples,
      essay: level2SourcedEssay,
      metrics: level2SourcedMetrics,
      heuristic: level2SourcedHeuristic,
    }),
  ]);

  fs.writeFileSync(path.join(scenario.outputDir, "level1-essay.txt"), `${level1Essay}\n`);
  fs.writeFileSync(path.join(scenario.outputDir, "level2-essay.txt"), `${level2Essay}\n`);
  fs.writeFileSync(path.join(scenario.outputDir, "level2-sourced-essay.txt"), `${level2SourcedEssay}\n`);

  const report = [
    "# Generation QA Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    markdownSection("Scenario", scenario.summaryLines.join("\n")),
    markdownSection("Level 1 Scores", [
      `Heuristic AI resistance: ${level1Heuristic.aiDetectionResistance}/10`,
      `Heuristic authenticity: ${level1Heuristic.authenticity}/10`,
      `Judge AI resistance: ${level1Judge.aiDetectionResistance}/10`,
      `Judge sample accuracy: ${level1Judge.sampleAccuracy}/10`,
      `Judge rubric accuracy: ${level1Judge.rubricAccuracy}/10`,
      `Judge evidence handling: ${level1Judge.evidenceHandling}/10`,
      `Judge overall writing: ${level1Judge.overallWriting}/10`,
      "",
      `Verdict: ${level1Judge.overallVerdict}`,
      "",
      `Strengths: ${level1Judge.strengths.join("; ")}`,
      `Weaknesses: ${level1Judge.weaknesses.join("; ")}`,
      `Priority fixes: ${level1Judge.priorityFixes.join("; ")}`,
      "",
      "Metrics:",
      "```json",
      JSON.stringify(level1Metrics, null, 2),
      "```",
    ].join("\n")),
    markdownSection("Level 2 Scores", [
      `Heuristic AI resistance: ${level2Heuristic.aiDetectionResistance}/10`,
      `Heuristic authenticity: ${level2Heuristic.authenticity}/10`,
      `Judge AI resistance: ${level2Judge.aiDetectionResistance}/10`,
      `Judge sample accuracy: ${level2Judge.sampleAccuracy}/10`,
      `Judge rubric accuracy: ${level2Judge.rubricAccuracy}/10`,
      `Judge evidence handling: ${level2Judge.evidenceHandling}/10`,
      `Judge overall writing: ${level2Judge.overallWriting}/10`,
      "",
      `Verdict: ${level2Judge.overallVerdict}`,
      "",
      `Strengths: ${level2Judge.strengths.join("; ")}`,
      `Weaknesses: ${level2Judge.weaknesses.join("; ")}`,
      `Priority fixes: ${level2Judge.priorityFixes.join("; ")}`,
      "",
      "Metrics:",
      "```json",
      JSON.stringify(level2Metrics, null, 2),
      "```",
    ].join("\n")),
    markdownSection("Level 2 + Sources Scores", [
      `Heuristic AI resistance: ${level2SourcedHeuristic.aiDetectionResistance}/10`,
      `Heuristic authenticity: ${level2SourcedHeuristic.authenticity}/10`,
      `Judge AI resistance: ${level2SourcedJudge.aiDetectionResistance}/10`,
      `Judge sample accuracy: ${level2SourcedJudge.sampleAccuracy}/10`,
      `Judge rubric accuracy: ${level2SourcedJudge.rubricAccuracy}/10`,
      `Judge evidence handling: ${level2SourcedJudge.evidenceHandling}/10`,
      `Judge overall writing: ${level2SourcedJudge.overallWriting}/10`,
      "",
      `Verdict: ${level2SourcedJudge.overallVerdict}`,
      "",
      `Strengths: ${level2SourcedJudge.strengths.join("; ")}`,
      `Weaknesses: ${level2SourcedJudge.weaknesses.join("; ")}`,
      `Priority fixes: ${level2SourcedJudge.priorityFixes.join("; ")}`,
      "",
      "Metrics:",
      "```json",
      JSON.stringify(level2SourcedMetrics, null, 2),
      "```",
    ].join("\n")),
    markdownSection("Level 1 Essay", `\`\`\`\n${level1Essay}\n\`\`\``),
    markdownSection("Level 2 Essay", `\`\`\`\n${level2Essay}\n\`\`\``),
    markdownSection("Level 2 + Sources Essay", `\`\`\`\n${level2SourcedEssay}\n\`\`\``),
  ].join("\n");

  fs.writeFileSync(path.join(scenario.outputDir, "report.md"), report);

  console.log(JSON.stringify({
    scenario: scenario.name,
    level1: {
      heuristic: level1Heuristic,
      judge: level1Judge,
    },
    level2: {
      heuristic: level2Heuristic,
      judge: level2Judge,
    },
    level2Sourced: {
      heuristic: level2SourcedHeuristic,
      judge: level2SourcedJudge,
    },
    outputDir: scenario.outputDir,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
