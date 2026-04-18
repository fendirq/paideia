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

async function analyzeStyle(samples: { label: string; content: string }[]): Promise<Prisma.InputJsonValue | null> {
  if (!samples.length) return null;

  let provider;
  try {
    provider = getProvider();
  } catch {
    // No LLM provider configured — skip style analysis rather than 500.
    return null;
  }

  const prompt = buildStyleAnalysisPrompt(samples);

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

    // Strip markdown code fences if present
    const content = response.text
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(content);
    return parsed as Prisma.InputJsonValue;
  } catch {
    return null;
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
  } catch {
    return NextResponse.json({ error: "Failed to save profile. Please try again." }, { status: 500 });
  }

  // Run style analysis in parallel (non-blocking for the save)
  // but we wait for it so the user sees "Analyzing..." state
  const fingerprint = await analyzeStyle(
    samples.map((s) => ({ label: s.label, content: s.content }))
  );

  if (fingerprint) {
    await db.writingProfile.update({
      where: { userId },
      data: { styleFingerprint: fingerprint },
    });
  }

  return NextResponse.json({ success: true, hasFingerprint: !!fingerprint });
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
