import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";
import { createSseParserState, extractSseDataMessages, flushSseDataMessages } from "@/lib/sse";
import {
  buildLevel1Prompt,
  buildLevel2PlanPrompt,
  buildLevel2WritingPrompt,
  buildLevel2CritiquePrompt,
  buildLevel2AuditPrompt,
  buildLevel2ExpansionPrompt,
  buildLegacyLevel1Prompt,
  normalizeFingerprint,
  humanizeEssay,
  sanitizeEssayOutput,
} from "@/lib/essay-generator";
import type {
  TeacherProfile,
  SelfAssessment,
  GenerateOptions,
  LegacyGenerateOptions,
} from "@/lib/essay-generator";

export const maxDuration = 300;

const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";
const LEVEL1_MODEL = "deepseek-ai/DeepSeek-V3";
const LEVEL2_PRIMARY_MODEL =
  process.env.ANTHROPIC_LEVEL2_PRIMARY_MODEL ||
  process.env.ANTHROPIC_MODEL ||
  "claude-opus-4-6";
const LEVEL2_FALLBACK_MODEL =
  process.env.ANTHROPIC_LEVEL2_FALLBACK_MODEL ||
  "claude-sonnet-4-6";

const LEVEL2_PLAN_TIMEOUT_MS = 60_000;
const LEVEL2_DRAFT_TIMEOUT_MS = 90_000;
const LEVEL2_CRITIQUE_TIMEOUT_MS = 45_000;
const LEVEL2_REVISION_TIMEOUT_MS = 75_000;

interface GenerateBody {
  assignment: string;
  wordCount: number;
  requirements?: string;
  level: 1 | 2;
}

function resolveSelectedValue(value: string | null | undefined, other: string | null | undefined): string {
  if (value === "__other__") {
    return other?.trim() || "";
  }
  return value?.trim() || "";
}

function isTimeoutError(err: unknown): boolean {
  return err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError");
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isValidCritique(text: string): boolean {
  return /VERDICT:/i.test(text) && /PRIORITY FIXES:/i.test(text) && /KEEP:/i.test(text);
}

function isUsableEssayCandidate(text: string, targetWordCount: number): boolean {
  if (!text) return false;
  if (/VERDICT:|PRIORITY FIXES:|KEEP:/i.test(text)) return false;
  if (!/[.!?]/.test(text)) return false;

  const words = countWords(text);
  const minimumWords = Math.max(120, Math.floor(targetWordCount * 0.45));
  return words >= minimumWords;
}

function needsExpansionPass(text: string, targetWordCount: number): boolean {
  const genericEvidencePattern = /\b(in class|in the sources|we learned that|history shows|the text says)\b/i;
  return countWords(text) < Math.floor(targetWordCount * 0.85) || genericEvidencePattern.test(text);
}

function extractAnthropicText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function shouldFallbackAnthropic(err: unknown): boolean {
  if (err instanceof Anthropic.APIConnectionError) return true;
  if (err instanceof Anthropic.APIError) {
    return err.status === 400 || err.status === 404 || err.status === 429 || (err.status !== undefined && err.status >= 500);
  }
  return false;
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
    timeoutMs,
    stageLabel,
    thinking,
  }: {
    prompt: string;
    system: string;
    maxTokens: number;
    temperature?: number;
    timeoutMs: number;
    stageLabel: string;
    thinking?: { type: "adaptive"; display?: "summarized" | "omitted" };
  }
): Promise<Anthropic.Message> {
  const models = [LEVEL2_PRIMARY_MODEL];
  if (LEVEL2_FALLBACK_MODEL && LEVEL2_FALLBACK_MODEL !== LEVEL2_PRIMARY_MODEL) {
    models.push(LEVEL2_FALLBACK_MODEL);
  }

  let lastError: unknown;
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const useThinking = Boolean(thinking && shouldUseAdaptiveThinking(model));
      return await anthropic.messages.create(
        {
          model,
          max_tokens: maxTokens,
          ...(!useThinking && temperature !== undefined ? { temperature } : {}),
          system,
          messages: [{ role: "user", content: prompt }],
          ...(useThinking ? { thinking } : {}),
        },
        { signal: AbortSignal.timeout(timeoutMs) }
      );
    } catch (err) {
      lastError = err;
      const canRetry = i < models.length - 1 && !isTimeoutError(err) && shouldFallbackAnthropic(err);
      if (!canRetry) throw err;
      console.warn(`Level 2 ${stageLabel} failed on ${model}; retrying with ${models[i + 1]}.`, err);
    }
  }

  throw lastError;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: GenerateBody = await req.json();
  const { assignment, wordCount, requirements, level } = body;

  if (!assignment?.trim()) {
    return NextResponse.json({ error: "Assignment is required" }, { status: 400 });
  }
  if (typeof wordCount !== "number" || wordCount < 250 || wordCount > 2000) {
    return NextResponse.json({ error: "Word count must be between 250 and 2000" }, { status: 400 });
  }
  if (typeof level !== "number" || (level !== 1 && level !== 2)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
  if (assignment.length > 5000 || (requirements && requirements.length > 5000)) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const userId = session.user.id;

  const [profile, samples, paymentUser] = await Promise.all([
    db.writingProfile.findUnique({ where: { userId } }),
    db.writingSample.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    level === 2
      ? db.user.findUnique({ where: { id: userId }, select: { level2PaidAt: true, role: true } })
      : null,
  ]);

  if (!profile || !samples.length) {
    return NextResponse.json({ error: "Complete your writing profile first" }, { status: 400 });
  }

  // Guard: Level 2 generation requires a Level 2 profile
  if (level === 2 && profile.level !== 2) {
    return NextResponse.json({ error: "Level 2 generation requires a Level 2 profile. Update your profile first." }, { status: 400 });
  }

  // Guard: Level 2 generation requires payment (admin bypass)
  if (level === 2 && paymentUser?.role !== "ADMIN" && !paymentUser?.level2PaidAt) {
    return NextResponse.json({ error: "Level 2 requires an upgrade. Visit the upgrade page to unlock." }, { status: 403 });
  }

  const sampleData = samples.map((s) => ({ label: s.label, content: s.content }));
  const rawFingerprint = profile.styleFingerprint as Record<string, unknown> | null;

  if (rawFingerprint) {
    if (!profile.teacherProfile || !profile.selfAssessment) {
      return NextResponse.json({ error: "Incomplete profile. Please update your writing profile." }, { status: 400 });
    }
    const fingerprint = normalizeFingerprint(rawFingerprint);
    const tp = profile.teacherProfile as unknown as TeacherProfile;
    const sa = profile.selfAssessment as unknown as SelfAssessment;

    // Ensure backward compat: if old profile shape is loaded, provide defaults
    const teacherProfile: TeacherProfile = {
      gradeLevel: tp.gradeLevel || "",
      gradeOther: tp.gradeOther || "",
      losesPointsFor: tp.losesPointsFor || [],
      losesPointsOther: tp.losesPointsOther || "",
    };

    const selfAssessment: SelfAssessment = {
      gradeRange: sa.gradeRange || "",
      gradeRangeOther: sa.gradeRangeOther || "",
      revisionLevel: sa.revisionLevel || "",
      revisionOther: sa.revisionOther || "",
      evidenceApproach: sa.evidenceApproach || "",
      evidenceOther: sa.evidenceOther || "",
      conclusionApproach: sa.conclusionApproach || "",
      conclusionOther: sa.conclusionOther || "",
      wordCountTendency: sa.wordCountTendency || "",
      wordCountOther: sa.wordCountOther || "",
      writingHabits: sa.writingHabits || [],
      writingHabitsOther: sa.writingHabitsOther || "",
      quoteIntroStyle: sa.quoteIntroStyle,
      quoteIntroOther: sa.quoteIntroOther,
      overusedPhrases: sa.overusedPhrases,
      overusedPhrasesOther: sa.overusedPhrasesOther,
      selfEditFocus: sa.selfEditFocus,
      selfEditOther: sa.selfEditOther,
      timeSpentOn: sa.timeSpentOn,
      timeSpentOther: sa.timeSpentOther,
    };

    const opts: GenerateOptions = {
      teacherProfile,
      selfAssessment,
      fingerprint,
      samples: sampleData,
      assignment,
      wordCount,
      requirements,
    };

    if (level === 1) {
      return streamLevel1(opts);
    } else {
      return await streamLevel2Anthropic(opts);
    }
  } else {
    // Legacy fallback — old profile shape, no fingerprint (Level 1 only)
    if (level === 2) {
      return NextResponse.json(
        { error: "Level 2 requires a style fingerprint. Please update your writing profile first." },
        { status: 400 }
      );
    }

    const profileData = {
      teacherProfile: profile.teacherProfile as Record<string, unknown>,
      selfAssessment: profile.selfAssessment as Record<string, unknown>,
      writingStyle: (profile.writingStyle ?? {}) as Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const legacyOpts: LegacyGenerateOptions = {
      profile: profileData,
      samples: sampleData,
      assignment,
      wordCount,
      requirements,
    };

    return streamLegacy(legacyOpts);
  }
}

// ─── Level 1: DeepSeek-V3 via Together AI ───

function streamLevel1(opts: GenerateOptions): Response {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Together API key not configured" }, { status: 500 });
  }

  const systemPrompt = buildLevel1Prompt(opts);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(TOGETHER_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: LEVEL1_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Write the essay now." },
            ],
            stream: true,
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        if (!res.ok || !res.body) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `API error: ${res.status}` })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        await pipeTogetherStream(res.body, controller, encoder);
      } catch {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Connection failed" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch { /* controller may already be closed by pipeTogetherStream */ }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

// ─── Level 2: Anthropic premium pipeline (plan + draft + critique + revision) ───

async function streamLevel2Anthropic(opts: GenerateOptions): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey });

  let outline = "";
  let rawEssay = "";
  let critiqueNotes = "";

  try {
    // Step 1: Structural plan
    const planPrompt = buildLevel2PlanPrompt(opts);
    const outlineMsg = await createLevel2Message(anthropic, {
      prompt: planPrompt,
      system: "You are an essay planning assistant. Create a concise structural outline for the assignment.",
      maxTokens: 2048,
      temperature: 0.25,
      timeoutMs: LEVEL2_PLAN_TIMEOUT_MS,
      stageLabel: "planning",
      thinking: { type: "adaptive", display: "omitted" },
    });
    outline = extractAnthropicText(outlineMsg);

    // Step 2: Sample-first draft
    const writingPrompt = buildLevel2WritingPrompt(opts, outline);
    const gradeCtx = resolveSelectedValue(opts.teacherProfile.gradeLevel, opts.teacherProfile.gradeOther) || "high school";
    const gradeRange = resolveSelectedValue(opts.selfAssessment.gradeRange, opts.selfAssessment.gradeRangeOther) || "B";
    const essayMsg = await createLevel2Message(anthropic, {
      prompt: writingPrompt,
      system: `You are ghostwriting an essay as a ${gradeCtx} student who typically earns ${gradeRange}. Your only goal is to produce writing indistinguishable from their own. Study their writing samples — they are your primary guide. Match their vocabulary, sentence patterns, paragraph habits, and mistakes. Write exactly as they would. Not better. Not worse. Never write a perfect essay.`,
      maxTokens: 5000,
      temperature: 0.55,
      timeoutMs: LEVEL2_DRAFT_TIMEOUT_MS,
      stageLabel: "drafting",
    });
    rawEssay = sanitizeEssayOutput(extractAnthropicText(essayMsg));
  } catch (err) {
    const isTimeout = isTimeoutError(err);
    return NextResponse.json(
      { error: isTimeout
          ? "Generation timed out. Please try again or use a shorter assignment."
          : "Generation failed. Please try again." },
      { status: isTimeout ? 504 : 502 },
    );
  }

  if (!rawEssay) {
    return NextResponse.json(
      { error: "Essay generation returned empty content. Please try again." },
      { status: 502 },
    );
  }

  if (!isUsableEssayCandidate(rawEssay, opts.wordCount)) {
    return NextResponse.json(
      { error: "Essay generation returned malformed content. Please try again." },
      { status: 502 },
    );
  }

  // Step 3: Critique pass — diagnose authenticity misses before rewriting
  try {
    const critiquePrompt = buildLevel2CritiquePrompt(
      rawEssay,
      opts.fingerprint,
      opts.samples,
    );
    const critiqueMsg = await createLevel2Message(anthropic, {
      prompt: critiquePrompt,
      system: "You are a writing-forensics critic. Diagnose where a generated essay fails to match a student's real writing, prioritizing the highest-risk AI tells and voice mismatches.",
      maxTokens: 2500,
      temperature: 0.1,
      timeoutMs: LEVEL2_CRITIQUE_TIMEOUT_MS,
      stageLabel: "critique",
      thinking: { type: "adaptive", display: "omitted" },
    });
    const critiqueCandidate = extractAnthropicText(critiqueMsg).trim();
    critiqueNotes = isValidCritique(critiqueCandidate) ? critiqueCandidate : "";
  } catch (err) {
    console.warn("Level 2 critique stage failed; continuing without critique notes.", err);
  }

  // Step 4: Forensic revision — compare against student's real samples, fix voice mismatches
  const auditPrompt = buildLevel2AuditPrompt(
    rawEssay,
    opts.fingerprint,
    opts.samples,
    critiqueNotes,
  );

  let auditedEssay = "";
  try {
    const auditMsg = await createLevel2Message(anthropic, {
      prompt: auditPrompt,
      system: "You are a writing forensics expert. Rewrite the essay so a teacher who knows the student's real work would believe they wrote it. Fix voice mismatches, but do not make the essay better than the student actually writes.",
      maxTokens: 5000,
      temperature: 0.2,
      timeoutMs: LEVEL2_REVISION_TIMEOUT_MS,
      stageLabel: "revision",
    });

    auditedEssay = sanitizeEssayOutput(extractAnthropicText(auditMsg));
  } catch (err) {
    console.warn("Level 2 revision stage failed; falling back to draft output.", err);
  }

  if (auditedEssay && !isUsableEssayCandidate(auditedEssay, opts.wordCount)) {
    console.warn("Level 2 revision returned malformed content; falling back to draft output.");
    auditedEssay = "";
  }

  // Step 5: Expansion recovery — fix short or placeholder-heavy essays without losing voice
  let baseEssay = auditedEssay || rawEssay;
  if (needsExpansionPass(baseEssay, opts.wordCount)) {
    try {
      const expansionMsg = await createLevel2Message(anthropic, {
        prompt: buildLevel2ExpansionPrompt(baseEssay, opts, critiqueNotes),
        system: "You are extending a student's essay without changing who they sound like. Keep the same argument and voice, but make the draft feel complete and concrete.",
        maxTokens: 5000,
        temperature: 0.25,
        timeoutMs: LEVEL2_REVISION_TIMEOUT_MS,
        stageLabel: "expansion",
      });
      const expandedEssay = sanitizeEssayOutput(extractAnthropicText(expansionMsg));
      if (isUsableEssayCandidate(expandedEssay, opts.wordCount) && countWords(expandedEssay) >= countWords(baseEssay)) {
        baseEssay = expandedEssay;
      }
    } catch (err) {
      console.warn("Level 2 expansion stage failed; keeping current essay.", err);
    }
  }

  // Step 6: Deterministic post-processing — inject contractions and error patterns
  const finalEssay = sanitizeEssayOutput(humanizeEssay(baseEssay, opts.fingerprint));

  // Stream the final essay to the client in chunks for consistent UX
  const encoder = new TextEncoder();
  const CHUNK_SIZE = 80;
  const stream = new ReadableStream({
    start(controller) {
      for (let i = 0; i < finalEssay.length; i += CHUNK_SIZE) {
        const chunk = finalEssay.slice(i, i + CHUNK_SIZE);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
        );
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

// ─── Legacy: DeepSeek-V3 for old profiles without fingerprint ───

function streamLegacy(opts: LegacyGenerateOptions): Response {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Together API key not configured" }, { status: 500 });
  }

  const systemPrompt = buildLegacyLevel1Prompt(opts);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(TOGETHER_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: LEVEL1_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Write the essay now." },
            ],
            stream: true,
            max_tokens: 4096,
            temperature: 0.7,
          }),
        });

        if (!res.ok || !res.body) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `API error: ${res.status}` })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        await pipeTogetherStream(res.body, controller, encoder);
      } catch {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Connection failed" })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch { /* controller may already be closed by pipeTogetherStream */ }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

// ─── Together AI stream helper ───

async function pipeTogetherStream(
  body: ReadableStream<Uint8Array>,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const sseState = createSseParserState();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const messages = extractSseDataMessages(sseState, chunk);

      for (const data of messages) {
        if (data === "[DONE]") {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          continue;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        } catch {
          // skip parse errors
        }
      }
    }

    for (const data of flushSseDataMessages(sseState)) {
      if (data === "[DONE]") {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        continue;
      }
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
          );
        }
      } catch {
        // skip malformed trailing SSE chunks
      }
    }
  } catch (err) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
  } finally {
    reader.releaseLock();
    controller.close();
  }
}
