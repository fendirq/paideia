import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProvider } from "@/lib/providers";
import { createSseParserState, extractSseDataMessages, flushSseDataMessages } from "@/lib/sse";
import {
  formatSourceContextForPrompt,
  inferRequiredEvidenceCount,
  inferWordCountBounds,
  normalizeSourceLinks,
  type ResolvedSource,
} from "@/lib/source-context";
import { fetchSourceContext } from "@/lib/source-fetch";
import {
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
  buildLegacyLevel1Prompt,
  isNarrativeAssignment,
  normalizeSupportedSourceAttribution,
  normalizeFingerprint,
  polishLevel2SurfaceVoice,
  sanitizeEssayOutput,
  stripUnsupportedSourceAttribution,
} from "@/lib/essay-generator";
import type {
  TeacherProfile,
  SelfAssessment,
  GenerateOptions,
  LegacyGenerateOptions,
} from "@/lib/essay-generator";

// maxDuration=300 is the Vercel default/ceiling on non-Enterprise plans
// (Fluid Compute). A higher value caused the first preview deploy to fail
// post-build during "Deploying outputs..." — the platform rejects
// maxDuration > plan limit at function-packaging time. Keeping 300 and
// budgeting per-stage timeouts to fit.
export const maxDuration = 300;

const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";
// Level 1 model is env-driven so DeepSeek V3 vs Kimi (or any Together-hosted
// model) can be swapped without a code change. Default preserves current
// production behavior.
const LEVEL1_MODEL = process.env.LEVEL1_MODEL?.trim() || "deepseek-ai/DeepSeek-V3";

// Per-stage timeouts sized for Gemini thinking-mode and the 300s
// maxDuration ceiling. Sum of the core-4 passes (plan + draft + critique
// + audit) must be < 300s: 50 + 120 + 40 + 75 = 285s. Optional passes
// (expansion, evidence, attribution, compliance, trim, source-flow) run
// only conditionally on argumentative assignments; narrative path skips
// all optional passes (see qa-generation.ts isNarrativeAssignment gating)
// so the full narrative pipeline easily fits. For argumentative
// assignments with many conditional passes active, worst case uses the
// full 300s — the reducer logic preserves the current essay on pass
// failures so timeouts degrade gracefully.
const LEVEL2_PLAN_TIMEOUT_MS = 50_000;
const LEVEL2_DRAFT_TIMEOUT_MS = 120_000;
const LEVEL2_CRITIQUE_TIMEOUT_MS = 40_000;
const LEVEL2_REVISION_TIMEOUT_MS = 75_000;

interface GenerateBody {
  assignment: string;
  wordCount: number;
  requirements?: string;
  level: 1 | 2;
  sourceLinks?: string[];
  sourceText?: string;
}

function isTimeoutError(err: unknown): boolean {
  return err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError");
}

// Distinguishes a client-side disconnect (which is not a failure and
// should not be logged or surfaced as an error) from a real stream
// error. A `TimeoutError` is a server-side abort that we DO want to
// surface; only a plain `AbortError` with no timer is treated as a
// client cancel.
function isClientAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countParagraphs(text: string): number {
  return text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean).length;
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

function passesRevisionLengthFloor(text: string, targetWordCount: number, currentEssay: string): boolean {
  const revisedWords = countWords(text);
  const currentWords = countWords(currentEssay);
  return revisedWords >= Math.max(Math.floor(targetWordCount * 0.7), currentWords - 120);
}

// The trim pass exists specifically to cut content, so the
// `currentEssay - 120` delta from `passesRevisionLengthFloor` does not
// apply — a valid trim from, say, 1350 → 1050 would always fail the
// revision floor and leave the overlong essay in place. Enforce only
// the absolute floor: rubric minimum (if known) or 70 % of target.
function passesTrimLengthFloor(text: string, targetWordCount: number, rubricMin: number | null): boolean {
  const revisedWords = countWords(text);
  const floor = Math.max(rubricMin ?? 0, Math.floor(targetWordCount * 0.7));
  return revisedWords >= floor;
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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: GenerateBody = await req.json();
  const { assignment, wordCount, requirements, level, sourceLinks, sourceText } = body;

  if (!assignment?.trim()) {
    return NextResponse.json({ error: "Assignment is required" }, { status: 400 });
  }
  if (typeof wordCount !== "number" || wordCount < 250 || wordCount > 2000) {
    return NextResponse.json({ error: "Word count must be between 250 and 2000" }, { status: 400 });
  }
  if (typeof level !== "number" || (level !== 1 && level !== 2)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
  if (assignment.length > 5000 || (requirements && requirements.length > 5000) || (sourceText && sourceText.length > 4000)) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const normalizedSourceLinks = normalizeSourceLinks(sourceLinks);
  const hasPastedNotes = Boolean(sourceText?.trim());
  let sourceContext = "";
  if (normalizedSourceLinks.length > 0 || hasPastedNotes) {
    let fetchedSources: ResolvedSource[] = [];
    if (normalizedSourceLinks.length > 0) {
      const result = await fetchSourceContext(normalizedSourceLinks);
      if (result.failures.length > 0) {
        console.warn("portal.generate: source fetch had failures", {
          userId: session.user.id,
          hasPastedNotes,
          failures: result.failures,
        });
        // Policy: a failed URL is a hard 400 UNLESS the user also
        // pasted source notes. Pasted notes are the explicit opt-in
        // to "I'll supply source content manually" — treat them as
        // the fallback for unreadable / auth-gated / scanned links.
        // Without pasted notes, silently dropping a URL could make
        // the essay miss required evidence the user expected to
        // cover; we force them to fix the URL (or paste notes).
        if (!hasPastedNotes) {
          const detail = result.failures.map((f) => `${f.url}: ${f.reason}`).join("; ");
          return NextResponse.json(
            {
              error: `Couldn't read ${result.failures.length} of ${normalizedSourceLinks.length} source link${normalizedSourceLinks.length > 1 ? "s" : ""} (${detail}). Fix the URL${result.failures.length > 1 ? "s" : ""} or paste source notes manually.`,
            },
            { status: 400 },
          );
        }
      }
      fetchedSources = result.resolved;
    }
    sourceContext = formatSourceContextForPrompt(fetchedSources, sourceText);
    if (!sourceContext.trim()) {
      return NextResponse.json(
        { error: "Unable to read the provided source material. Try a different link or paste source notes manually." },
        { status: 400 },
      );
    }
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
      sourceContext,
    };

    if (level === 1) {
      return streamLevel1(opts);
    } else {
      return await streamLevel2(opts, userId);
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
      sourceContext,
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
      } catch (err) {
        // Client cancellation is not an error — no frame to emit.
        // Anything else is a real upstream or streaming failure that
        // needs an ops signal and a user-visible error frame.
        if (!isClientAbort(err)) {
          console.error("portal.generate: level 1 stream failed", {
            stage: "level1",
            model: LEVEL1_MODEL,
            err,
          });
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Level 1 generation failed. Please try again." })}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch { /* controller may already be closed by pipeTogetherStream */ }
        }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}

// ─── Level 2: premium pipeline (plan + draft + critique + revision) ───
// Provider is resolved via LEVEL2_PROVIDER env (default: gemini). The
// provider abstraction handles model selection, retry/fallback, and
// thinking-mode semantics consistently across vendors.

// Records stages that failed + fell back to a prior essay so the
// final response can surface this to the client as a header (for
// operator visibility) — structured log per stage goes to stderr so
// Vercel runtime logs capture the failure with its root cause.
function logStageDegradation(stage: string, userId: string, err?: unknown): void {
  console.error("portal.generate: level 2 stage degraded", {
    stage,
    userId,
    err: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
  });
}

async function streamLevel2(opts: GenerateOptions, userId: string): Promise<Response> {
  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    const message = err instanceof Error ? err.message : "LLM provider not configured";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  let outline = "";
  let rawEssay = "";
  let critiqueNotes = "";
  const degradedStages: string[] = [];

  try {
    // Step 1: Structural plan
    const planPrompt = buildLevel2PlanPrompt(opts);
    const outlineMsg = await provider.createLevel2Message({
      prompt: planPrompt,
      system: "You are an essay planning assistant. Create a concise structural outline for the assignment.",
      maxTokens: 2048,
      temperature: 0.25,
      timeoutMs: LEVEL2_PLAN_TIMEOUT_MS,
      stageLabel: "planning",
      thinking: true,
    });
    outline = outlineMsg.text;

    // Step 2: Sample-first draft
    const writingPrompt = buildLevel2WritingPrompt(opts, outline);
    const isNarrativeDraft = isNarrativeAssignment(opts.assignment, opts.requirements);
    const draftSystem = isNarrativeDraft
      ? `You are ghostwriting a personal narrative / creative nonfiction essay in this student's recognizable voice, but at a polished A-range craft floor. Match the student's voice described in the profile — sentence cadence, sensory channel, dialogue habits — while inventing an entirely new scene, subject, and sequence of images. Creative nonfiction rewards scene construction and sensory specificity, not thesis and evidence; do not force an analytical structure onto narrative material.${opts.sourceContext ? " Craft scaffolds may be referenced lightly if useful but are not required evidence." : ""}`
      : `You are ghostwriting an essay in this student's recognizable voice, but at a polished A-range quality floor. Study their writing samples as style references. Match their vocabulary preferences, sentence habits, and tone, but do not copy their weakest mistakes. The essay must be grammatically strong, thesis-driven, well-supported, and clearly argued.${opts.sourceContext ? " Use the approved source material directly." : " Without a source packet, keep the factual specificity at the level of a well-prepared student rather than a textbook or historian."}`;
    const essayMsg = await provider.createLevel2Message({
      prompt: writingPrompt,
      system: draftSystem,
      maxTokens: 5000,
      temperature: 0.55,
      timeoutMs: LEVEL2_DRAFT_TIMEOUT_MS,
      stageLabel: "drafting",
    });
    rawEssay = sanitizeEssayOutput(essayMsg.text);
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
      opts.sourceContext,
    );
    const critiqueMsg = await provider.createLevel2Message({
      prompt: critiquePrompt,
      system: "You are a writing-forensics critic. Diagnose where a generated essay fails to match a student's real writing, prioritizing the highest-risk AI tells and voice mismatches.",
      maxTokens: 2500,
      temperature: 0.1,
      timeoutMs: LEVEL2_CRITIQUE_TIMEOUT_MS,
      stageLabel: "critique",
      thinking: true,
    });
    const critiqueCandidate = critiqueMsg.text.trim();
    critiqueNotes = isValidCritique(critiqueCandidate) ? critiqueCandidate : "";
  } catch (err) {
    logStageDegradation("critique", userId, err);
    degradedStages.push("critique");
  }

  // Step 4: Forensic revision — compare against student's real samples, fix voice mismatches
  const auditPrompt = buildLevel2AuditPrompt(
    rawEssay,
    opts.fingerprint,
    opts.samples,
    critiqueNotes,
    opts.sourceContext,
    opts.assignment,
    opts.requirements,
  );

  let auditedEssay = "";
  try {
    const auditMsg = await provider.createLevel2Message({
      prompt: auditPrompt,
      system: `You are a writing forensics expert. Rewrite the essay so a teacher who knows the student's real work would believe they wrote it. Preserve the student's recognizable voice, but make the essay polished, coherent, well-supported, and strong enough to satisfy an A-range assignment standard.${opts.sourceContext ? " Ground the essay in the approved sources." : " Keep no-source essays concrete, but do not let them drift into textbook-level precision."}`,
      maxTokens: 5000,
      temperature: 0.2,
      timeoutMs: LEVEL2_REVISION_TIMEOUT_MS,
      stageLabel: "revision",
    });

    auditedEssay = sanitizeEssayOutput(auditMsg.text);
  } catch (err) {
    logStageDegradation("revision", userId, err);
    degradedStages.push("revision");
  }

  if (auditedEssay && !isUsableEssayCandidate(auditedEssay, opts.wordCount)) {
    logStageDegradation("revision-malformed", userId);
    degradedStages.push("revision");
    auditedEssay = "";
  }

  // Step 5: Expansion recovery — fix short or placeholder-heavy essays without losing voice
  let baseEssay = auditedEssay || rawEssay;
  if (needsExpansionPass(baseEssay, opts.wordCount)) {
    try {
      const expansionMsg = await provider.createLevel2Message({
        prompt: buildLevel2ExpansionPrompt(baseEssay, opts, critiqueNotes),
        system: "You are extending a student's essay without changing who they sound like. Keep the same argument and voice, but make the draft feel complete and concrete.",
        maxTokens: 5000,
        temperature: 0.25,
        timeoutMs: LEVEL2_REVISION_TIMEOUT_MS,
        stageLabel: "expansion",
      });
      const expandedEssay = sanitizeEssayOutput(expansionMsg.text);
      if (isUsableEssayCandidate(expandedEssay, opts.wordCount) && countWords(expandedEssay) >= countWords(baseEssay)) {
        baseEssay = expandedEssay;
      }
    } catch (err) {
      logStageDegradation("expansion", userId, err);
      degradedStages.push("expansion");
    }
  }

  // Steps 6-8: Evidence / Attribution / Compliance passes are skipped for
  // narrative assignments. These passes were designed for argumentative
  // essays and inject analytical scaffolding ("this matters because",
  // citations, rubric-keyword-forcing) that breaks narrative immersion.
  // Phase 3 stress test confirmed: with these passes on, creative-writing
  // scored 4/10; skipping them for narrative is the pipeline-level fix.
  const requirementText = `${opts.assignment}\n${opts.requirements ?? ""}`;
  const requiredEvidenceCount = inferRequiredEvidenceCount(requirementText);
  const bounds = inferWordCountBounds(requirementText);
  const isNarrative = isNarrativeAssignment(opts.assignment, opts.requirements);

  if (!isNarrative) {
    try {
      const evidenceMsg = await provider.createLevel2Message({
        prompt: buildLevel2EvidenceIntegrationPrompt(baseEssay, opts, {
          requiredEvidenceCount,
        }),
        system: `You are strengthening the evidence and analysis in a student-voice essay. Preserve the voice, but make every paragraph concrete and clearly explained.${opts.sourceContext ? " Use the approved source material directly when improving support." : " Without sources, keep the details plausible for a prepared student and avoid historian-level precision."}`,
        maxTokens: 5000,
        temperature: 0.15,
        timeoutMs: LEVEL2_REVISION_TIMEOUT_MS,
        stageLabel: "evidence",
      });
      const evidenceEssay = sanitizeEssayOutput(evidenceMsg.text);
      if (isUsableEssayCandidate(evidenceEssay, opts.wordCount) && passesRevisionLengthFloor(evidenceEssay, opts.wordCount, baseEssay)) {
        baseEssay = evidenceEssay;
      }
    } catch (err) {
      logStageDegradation("evidence", userId, err);
      degradedStages.push("evidence");
    }

    if (opts.sourceContext || bounds.max) {
      try {
        const attributionMsg = await provider.createLevel2Message({
          prompt: buildLevel2AttributionPrompt(baseEssay, opts, {
            maxWords: bounds.max,
          }),
          system: "You are making source use explicit in a student-voice essay. Preserve the essay's strength, but make the evidence feel clearly grounded and trim excess length if needed.",
          maxTokens: 5000,
          temperature: 0.12,
          timeoutMs: LEVEL2_REVISION_TIMEOUT_MS,
          stageLabel: "attribution",
        });
        const attributionEssay = sanitizeEssayOutput(attributionMsg.text);
        if (isUsableEssayCandidate(attributionEssay, opts.wordCount)) {
          baseEssay = attributionEssay;
        }
      } catch (err) {
        logStageDegradation("attribution", userId, err);
        degradedStages.push("attribution");
      }
    }

    try {
      const complianceMsg = await provider.createLevel2Message({
        prompt: buildLevel2CompliancePrompt(baseEssay, opts, {
          minWords: bounds.min,
          maxWords: bounds.max,
        }),
        system: `You are fixing assignment compliance issues in a student-voice essay. Preserve the voice, but make the essay clearly satisfy the prompt and rubric.${opts.sourceContext ? " Keep the evidence tied to the approved sources." : " Keep the evidence student-plausible instead of textbook-like."}`,
        maxTokens: 5000,
        temperature: 0.15,
        timeoutMs: LEVEL2_REVISION_TIMEOUT_MS,
        stageLabel: "compliance",
      });
      const complianceEssay = sanitizeEssayOutput(complianceMsg.text);
      if (
        isUsableEssayCandidate(complianceEssay, opts.wordCount) &&
        countWords(complianceEssay) >= Math.min(countWords(baseEssay), bounds.min ?? countWords(baseEssay))
      ) {
        baseEssay = complianceEssay;
      }
    } catch (err) {
      logStageDegradation("compliance", userId, err);
      degradedStages.push("compliance");
    }
  }

  // Step 9: Hard ceiling trim — if we still exceed the max, force a focused trim pass
  if (bounds.max && countWords(baseEssay) > bounds.max) {
    try {
      const trimMsg = await provider.createLevel2Message({
        prompt: buildLevel2TrimPrompt(baseEssay, opts, {
          maxWords: bounds.max,
        }),
        system: "You are trimming a student-voice essay to fit a hard word-count ceiling. Preserve the argument and evidence, but cut repetition and excess explanation.",
        maxTokens: 5000,
        temperature: 0.1,
        timeoutMs: LEVEL2_REVISION_TIMEOUT_MS,
        stageLabel: "trim",
      });
      const trimmedEssay = sanitizeEssayOutput(trimMsg.text);
      if (
        isUsableEssayCandidate(trimmedEssay, opts.wordCount) &&
        passesTrimLengthFloor(trimmedEssay, opts.wordCount, bounds.min) &&
        (isWithinMaxWords(trimmedEssay, bounds.max) || countWords(trimmedEssay) < countWords(baseEssay))
      ) {
        baseEssay = trimmedEssay;
      }
    } catch (err) {
      logStageDegradation("trim", userId, err);
      degradedStages.push("trim");
    }
  }

  // Step 10: Source flow pass — skipped for narrative (attribution ≠ narrative)
  if (!isNarrative && opts.sourceContext && needsSourceFlowPass(baseEssay)) {
    try {
      const flowMsg = await provider.createLevel2Message({
        prompt: buildLevel2SourceFlowPrompt(baseEssay, opts, {
          maxWords: bounds.max,
        }),
        system: "You are smoothing source integration in a student-voice essay. Preserve the argument and paragraph structure, but make attributions and repeated analytical phrases feel more natural.",
        maxTokens: 5000,
        temperature: 0.1,
        timeoutMs: LEVEL2_REVISION_TIMEOUT_MS,
        stageLabel: "source-flow",
      });
      const flowedEssay = sanitizeEssayOutput(flowMsg.text);
      if (
        isUsableEssayCandidate(flowedEssay, opts.wordCount) &&
        passesRevisionLengthFloor(flowedEssay, opts.wordCount, baseEssay) &&
        countParagraphs(flowedEssay) === countParagraphs(baseEssay) &&
        isWithinMaxWords(flowedEssay, bounds.max)
      ) {
        baseEssay = flowedEssay;
      }
    } catch (err) {
      logStageDegradation("source-flow", userId, err);
      degradedStages.push("source-flow");
    }
  }

  // Step 11: Final cleanup — keep Level 2 polished instead of re-injecting roughness
  baseEssay = opts.sourceContext
    ? normalizeSupportedSourceAttribution(baseEssay, opts.sourceContext)
    : stripUnsupportedSourceAttribution(baseEssay);
  const finalEssay = sanitizeEssayOutput(polishLevel2SurfaceVoice(baseEssay, opts.fingerprint));

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

  const headers: Record<string, string> = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
  if (degradedStages.length > 0) {
    // Deduplicate (revision can push twice on malformed vs. failed).
    headers["X-Paideia-Degraded-Stages"] = Array.from(new Set(degradedStages)).join(",");
  }
  return new Response(stream, { headers });
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
      } catch (err) {
        if (!isClientAbort(err)) {
          console.error("portal.generate: legacy stream failed", {
            stage: "legacy",
            model: LEVEL1_MODEL,
            err,
          });
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Generation failed. Please try again." })}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch { /* controller may already be closed by pipeTogetherStream */ }
        }
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
