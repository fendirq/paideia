import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { VALID_HELP_TYPES, isStructureAwareHelpType } from "@/lib/help-types";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inquiryId, helpType, classId } = await req.json();
  if (!inquiryId) {
    return NextResponse.json({ error: "inquiryId required" }, { status: 400 });
  }

  const inquiry = await db.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry || inquiry.userId !== session.user.id) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  // If classId provided, verify student is enrolled
  if (classId) {
    const enrollment = await db.classEnrollment.findUnique({
      where: { classId_studentId: { classId, studentId: session.user.id } },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this class" }, { status: 403 });
    }
  }

  const tutoringSession = await db.tutoringSession.create({
    data: {
      userId: session.user.id,
      inquiryId,
      classId: classId || null,
      helpType: resolveHelpType(helpType),
    },
  });

  return NextResponse.json(tutoringSession, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await db.tutoringSession.findMany({
    where: { userId: session.user.id },
    include: {
      inquiry: {
        select: { subject: true, unitName: true, teacherName: true },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(sessions);
}

// Accept either a static help-type value (from the VALID_HELP_TYPES
// set) or a dynamic structure-aware one (e.g. "work-through-problem-3").
// Without the prefix check the structure-aware menu silently drops to
// null and the tutor never sees the student's file-specific selection.
function resolveHelpType(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (VALID_HELP_TYPES.has(trimmed) || isStructureAwareHelpType(trimmed)) {
    return trimmed;
  }
  return null;
}
