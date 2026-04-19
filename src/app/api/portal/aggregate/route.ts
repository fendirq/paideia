import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildStyleAnalysisPrompt } from "@/lib/essay-generator";
import { getProvider } from "@/lib/providers";
import { Prisma } from "@/generated/prisma/client";

export const maxDuration = 90;

interface SampleInput {
  label: string;
  content: string;
  wordCount: number;
}

interface AggregateBody {
  level: number;
  samples: SampleInput[];
  teacherProfile: Prisma.InputJsonValue;
  selfAssessment: Prisma.InputJsonValue;
}

interface AnalyzeStyleOutcome {
  fingerprint: Prisma.InputJsonValue | null;
  // Populated when style analysis failed for a recoverable reason so the
  // caller can tell the difference between "no samples to analyze"
  // (fingerprint null, reason undefined) and "Gemini rejected the
  // request" (fingerprint null, reason set). Drives the UI warning.
  failureReason?: string;
}

async function analyzeStyle(
  samples: { label: string; content: string }[],
  userId: string,
): Promise<AnalyzeStyleOutcome> {
  if (!samples.length) return { fingerprint: null };

  let provider;
  try {
    provider = getProvider();
  } catch (err) {
    console.error("portal.aggregate: LLM provider not configured", { userId, err });
    return {
      fingerprint: null,
      failureReason: "style analysis provider not configured",
    };
  }

  const prompt = buildStyleAnalysisPrompt(samples);

  let raw: string;
  try {
    const response = await provider.createLevel2Message({
      prompt,
      system: "You are a forensic writing analyst. Extract granular patterns from student writing samples. Every claim must cite specific words, phrases, or patterns directly from the text. Return only valid JSON.",
      maxTokens: 8000,
      temperature: 0.2,
      timeoutMs: 90_000,
      stageLabel: "style-analysis",
      thinking: true,
    });
    raw = response.text;
  } catch (err) {
    console.error("portal.aggregate: style analysis provider call failed", { userId, err });
    return {
      fingerprint: null,
      failureReason: "style analysis provider call failed",
    };
  }

  // Strip markdown code fences if present
  const content = raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();

  if (!content) {
    console.error("portal.aggregate: style analysis returned empty response", { userId });
    return {
      fingerprint: null,
      failureReason: "style analysis returned empty response",
    };
  }

  try {
    const parsed = JSON.parse(content);
    return { fingerprint: parsed as Prisma.InputJsonValue };
  } catch (err) {
    console.error("portal.aggregate: style analysis returned non-JSON", {
      userId,
      preview: content.slice(0, 200),
      err,
    });
    return {
      fingerprint: null,
      failureReason: "style analysis returned non-JSON output",
    };
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: AggregateBody = await req.json();
  const { level, samples, teacherProfile, selfAssessment } = body;

  const profileLevel = level === 2 ? 2 : 1;

  if (!samples?.length) {
    return NextResponse.json({ error: "At least one writing sample is required" }, { status: 400 });
  }

  const MAX_SAMPLE_CHARS = 20_000;
  const MAX_TOTAL_CHARS = 80_000;
  let totalChars = 0;
  for (const s of samples) {
    if (s.content.length > MAX_SAMPLE_CHARS) {
      return NextResponse.json({ error: `Sample "${s.label}" exceeds ${MAX_SAMPLE_CHARS} character limit` }, { status: 400 });
    }
    totalChars += s.content.length;
  }
  if (totalChars > MAX_TOTAL_CHARS) {
    return NextResponse.json({ error: "Total sample content exceeds limit. Try shorter or fewer samples." }, { status: 400 });
  }

  const userId = session.user.id;

  // Save profile + samples in a transaction
  if (!teacherProfile || typeof teacherProfile !== "object" || Array.isArray(teacherProfile)) {
    return NextResponse.json({ error: "Invalid teacher profile data" }, { status: 400 });
  }
  if (!selfAssessment || typeof selfAssessment !== "object" || Array.isArray(selfAssessment)) {
    return NextResponse.json({ error: "Invalid self-assessment data" }, { status: 400 });
  }

  // Detect whether the sample set actually changed before touching
  // the existing fingerprint. If the user is only updating teacher
  // profile / self-assessment fields (same samples), a subsequent
  // analysis failure should NOT clear the valid fingerprint they
  // already have — that would downgrade future generations to the
  // legacy path for no reason. If the samples DID change, the old
  // fingerprint is stale by definition and we want it cleared on
  // analysis failure so the guard / warning fires.
  const existingSamples = await db.writingSample.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { content: true },
  });
  const samplesChanged =
    existingSamples.length !== samples.length ||
    existingSamples.some((existing, i) => existing.content !== samples[i].content);

  try {
    await db.$transaction(async (tx) => {
      await tx.writingProfile.upsert({
        where: { userId },
        create: {
          userId,
          level: profileLevel,
          teacherProfile,
          selfAssessment,
        },
        update: {
          level: profileLevel,
          teacherProfile,
          selfAssessment,
          writingStyle: Prisma.JsonNull, // clear legacy field
        },
      });

      await tx.writingSample.deleteMany({ where: { userId } });
      await tx.writingSample.createMany({
        data: samples.map((s) => ({
          userId,
          label: s.label,
          content: s.content,
          wordCount: s.wordCount,
        })),
      });
    });
  } catch (err) {
    console.error("portal.aggregate: profile save transaction failed", { userId, err });
    return NextResponse.json({ error: "Failed to save profile. Please try again." }, { status: 500 });
  }

  const styleOutcome = await analyzeStyle(
    samples.map((s) => ({ label: s.label, content: s.content })),
    userId,
  );

  if (styleOutcome.fingerprint) {
    try {
      await db.writingProfile.update({
        where: { userId },
        data: { styleFingerprint: styleOutcome.fingerprint },
      });
    } catch (err) {
      console.error("portal.aggregate: persisting fingerprint failed", { userId, err });
      return NextResponse.json(
        {
          error: "Style analysis ran, but we couldn't save its output. Please try again.",
          code: "FINGERPRINT_PERSIST_FAILED",
        },
        { status: 500 },
      );
    }
  } else if (samplesChanged) {
    // Analysis failed AND samples changed — the previous fingerprint
    // is stale. Clear it so generate/route.ts doesn't run the OLD
    // voice against NEW samples.
    try {
      await db.writingProfile.update({
        where: { userId },
        data: { styleFingerprint: Prisma.JsonNull },
      });
    } catch (err) {
      // Failing to clear is a degraded-but-not-fatal state; log and
      // continue. The stale fingerprint remains, but the warning
      // banner below still surfaces the analysis failure.
      console.error("portal.aggregate: clearing stale fingerprint failed", { userId, err });
    }
  }

  // For Level 2 profiles the fingerprint is required — generate/route.ts
  // hard-rejects Level 2 when profile.styleFingerprint is missing. A 200
  // here with hasFingerprint=false would let AggregateWizard redirect
  // the user away; they'd then hit the same trap-loop the P1-1 fix was
  // meant to prevent. Force a 500 with a specific code so the wizard
  // keeps the user on-page and they can retry.
  if (profileLevel === 2 && !styleOutcome.fingerprint) {
    return NextResponse.json(
      {
        error: `Style analysis could not complete (${styleOutcome.failureReason ?? "unknown reason"}). Your profile is saved, but Level 2 voice matching requires the fingerprint. Please try again.`,
        code: "LEVEL2_FINGERPRINT_REQUIRED",
      },
      { status: 500 },
    );
  }

  // Level 1 profiles work without a fingerprint. Surface the `warning`
  // field so the UI can still show an amber banner if analysis failed
  // but profile-save succeeded, while allowing the happy-path redirect.
  const response: {
    success: true;
    hasFingerprint: boolean;
    warning?: string;
  } = {
    success: true,
    hasFingerprint: !!styleOutcome.fingerprint,
  };
  if (!styleOutcome.fingerprint && styleOutcome.failureReason) {
    response.warning = `Profile saved, but style analysis could not complete (${styleOutcome.failureReason}).`;
  }
  return NextResponse.json(response);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [profile, samples] = await Promise.all([
    db.writingProfile.findUnique({ where: { userId } }),
    db.writingSample.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);

  if (!profile) {
    return NextResponse.json({ profile: null, samples: [] });
  }

  return NextResponse.json({
    profile: {
      level: profile.level,
      teacherProfile: profile.teacherProfile,
      selfAssessment: profile.selfAssessment,
      hasFingerprint: !!profile.styleFingerprint,
    },
    samples: samples.map((s) => ({
      label: s.label,
      content: s.content,
      wordCount: s.wordCount,
    })),
  });
}
