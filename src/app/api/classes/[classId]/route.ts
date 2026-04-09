import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await params;

  // Verify student is enrolled
  const enrollment = await db.classEnrollment.findUnique({
    where: { classId_studentId: { classId, studentId: session.user.id } },
  });

  if (!enrollment && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const cls = await db.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      subject: true,
      period: true,
      description: true,
      pinnedNote: true,
      teacher: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Get materials with file info
  const materials = await db.classMaterial.findMany({
    where: { classId },
    include: {
      files: { select: { id: true, fileName: true, fileType: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get student's sessions for this class (to determine progress per material)
  const sessions = await db.tutoringSession.findMany({
    where: { classId, userId: session.user.id, materialId: { not: null } },
    select: {
      id: true,
      materialId: true,
      status: true,
      _count: { select: { messages: true } },
    },
  });

  // Update lastVisitedAt
  if (enrollment) {
    await db.classEnrollment.update({
      where: { id: enrollment.id },
      data: { lastVisitedAt: new Date() },
    });
  }

  return NextResponse.json({
    ...cls,
    teacherName: cls.teacher?.name ?? null,
    materials: materials.map((m) => {
      const threadSession = sessions.find((s) => s.materialId === m.id);
      return {
        ...m,
        threadId: threadSession?.id ?? null,
        messageCount: threadSession?._count.messages ?? 0,
        status: threadSession
          ? threadSession.status === "COMPLETED" ? "reviewed" : "in_progress"
          : "not_started",
      };
    }),
  });
}
