import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

interface SampleInput {
  label: string;
  content: string;
  wordCount: number;
}

interface AggregateBody {
  samples: SampleInput[];
  teacherProfile: Prisma.InputJsonValue;
  selfAssessment: Prisma.InputJsonValue;
  writingStyle: Prisma.InputJsonValue;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: AggregateBody = await req.json();
  const { samples, teacherProfile, selfAssessment, writingStyle } = body;

  if (!samples?.length) {
    return NextResponse.json({ error: "At least one writing sample is required" }, { status: 400 });
  }

  const userId = session.user.id;

  // Upsert profile + replace samples in a transaction
  await db.$transaction(async (tx) => {
    // Upsert writing profile
    await tx.writingProfile.upsert({
      where: { userId },
      create: {
        userId,
        teacherProfile,
        selfAssessment,
        writingStyle,
      },
      update: {
        teacherProfile,
        selfAssessment,
        writingStyle,
      },
    });

    // Delete old samples, insert new ones
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

  return NextResponse.json({ success: true });
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
      writingStyle: profile.writingStyle,
    },
    samples: samples.map((s) => ({
      label: s.label,
      content: s.content,
      wordCount: s.wordCount,
    })),
  });
}
