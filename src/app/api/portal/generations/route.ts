import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");

  if (!subject) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  const essays = await db.generatedEssay.findMany({
    where: { userId: session.user.id, subject },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      assignment: true,
      level: true,
      wordCount: true,
      createdAt: true,
    },
    take: 20,
  });

  return NextResponse.json({ essays });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { subject, assignment, requirements, level, essay } = body;

  if (!subject || !assignment || !essay || ![1, 2].includes(level)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (typeof essay !== "string" || essay.length > 50000) {
    return NextResponse.json({ error: "Essay too large" }, { status: 400 });
  }

  const wordCount = essay.split(/\s+/).filter(Boolean).length;

  const saved = await db.generatedEssay.create({
    data: {
      userId: session.user.id,
      subject,
      assignment: assignment.slice(0, 5000),
      requirements: requirements?.slice(0, 1000) || null,
      level,
      essay,
      wordCount,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: saved.id });
}
