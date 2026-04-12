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
  const classId = searchParams.get("classId");

  if (!subject && !classId) {
    return NextResponse.json({ error: "Subject or classId is required" }, { status: 400 });
  }

  const where: { userId: string; subject?: string; portalClassId?: string } = {
    userId: session.user.id,
  };
  if (classId) {
    const owned = await db.portalClass.findUnique({
      where: { id: classId },
      select: { userId: true },
    });
    if (!owned || owned.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    where.portalClassId = classId;
  } else if (subject) {
    const normalized = subject.toUpperCase();
    if (!["HISTORY", "ENGLISH", "HUMANITIES"].includes(normalized)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }
    where.subject = normalized;
  }

  const essays = await db.generatedEssay.findMany({
    where,
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
  const { subject, assignment, requirements, level, essay, portalClassId } = body;

  const VALID_SUBJECTS = new Set(["history", "english", "humanities", "HISTORY", "ENGLISH", "HUMANITIES"]);
  if (!subject || !assignment || !essay || ![1, 2].includes(level) || !VALID_SUBJECTS.has(subject)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const normalizedSubject = subject.toUpperCase();

  if (typeof essay !== "string" || essay.length > 50000) {
    return NextResponse.json({ error: "Essay too large" }, { status: 400 });
  }

  if (portalClassId) {
    const owned = await db.portalClass.findUnique({
      where: { id: portalClassId },
      select: { userId: true },
    });
    if (!owned || owned.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const wordCount = essay.split(/\s+/).filter(Boolean).length;

  const saved = await db.generatedEssay.create({
    data: {
      userId: session.user.id,
      subject: normalizedSubject,
      assignment: assignment.slice(0, 5000),
      requirements: requirements?.slice(0, 5000) || null,
      level,
      essay,
      wordCount,
      portalClassId: portalClassId || null,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: saved.id });
}
