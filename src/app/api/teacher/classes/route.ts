import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateJoinCode } from "@/lib/join-code";
import type { Subject } from "@/generated/prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classes = await db.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { enrollments: true, sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, subject, period, description } = await req.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Class name is required" }, { status: 400 });
  }
  if (name.trim().length > 200) {
    return NextResponse.json({ error: "Class name too long" }, { status: 400 });
  }
  if (!subject || typeof subject !== "string") {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  const VALID_SUBJECTS = new Set<string>(["MATHEMATICS","ENGLISH","HISTORY","SCIENCE","MANDARIN","HUMANITIES","OTHER"]);
  if (!VALID_SUBJECTS.has(subject)) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  }
  const validatedSubject = subject as Subject;

  if (description && typeof description === "string" && description.trim().length > 1000) {
    return NextResponse.json({ error: "Description too long" }, { status: 400 });
  }

  if (period != null && (typeof period !== "number" || period < 1 || period > 7)) {
    return NextResponse.json({ error: "Period must be 1-7" }, { status: 400 });
  }

  const joinCode = await generateJoinCode();

  try {
    const newClass = await db.class.create({
      data: {
        teacherId: session.user.id,
        name: name.trim(),
        subject: validatedSubject,
        period: period ?? null,
        description: description?.trim() || null,
        joinCode,
      },
      include: {
        _count: { select: { enrollments: true, sessions: true } },
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      // Join code collision — retry once with new code
      try {
        const retryCode = await generateJoinCode();
        const newClass = await db.class.create({
          data: {
            teacherId: session.user.id,
            name: name.trim(),
            subject: validatedSubject,
            period: period ?? null,
            description: description?.trim() || null,
            joinCode: retryCode,
          },
          include: {
            _count: { select: { enrollments: true, sessions: true } },
          },
        });
        return NextResponse.json(newClass, { status: 201 });
      } catch {
        return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
      }
    }
    throw e;
  }
}
