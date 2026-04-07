import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildStyleAnalysisPrompt } from "@/lib/essay-generator";
import { Prisma } from "@/generated/prisma/client";

export const maxDuration = 60;

const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";
const ANALYSIS_MODEL = "deepseek-ai/DeepSeek-R1";

interface SampleInput {
  label: string;
  content: string;
  wordCount: number;
}

interface AggregateBody {
  samples: SampleInput[];
  teacherProfile: Prisma.InputJsonValue;
  selfAssessment: Prisma.InputJsonValue;
}

async function analyzeStyle(samples: { label: string; content: string }[]): Promise<Prisma.InputJsonValue | null> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey || !samples.length) return null;

  const prompt = buildStyleAnalysisPrompt(samples);

  try {
    const res = await fetch(TOGETHER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ANALYSIS_MODEL,
        messages: [
          { role: "system", content: "You are a writing style analyst. Return only valid JSON, no markdown fencing." },
          { role: "user", content: prompt },
        ],
        stream: false,
        max_tokens: 16000,
        temperature: 0.3,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    let content = data.choices?.[0]?.message?.content ?? "";

    // DeepSeek-R1 wraps answers in <think>...</think> tags — strip them
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Strip markdown code fences if present
    content = content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

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
  const { samples, teacherProfile, selfAssessment } = body;

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
  await db.$transaction(async (tx) => {
    await tx.writingProfile.upsert({
      where: { userId },
      create: {
        userId,
        teacherProfile,
        selfAssessment,
      },
      update: {
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
