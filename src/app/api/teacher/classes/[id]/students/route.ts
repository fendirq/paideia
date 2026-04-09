import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify class belongs to this teacher (ADMIN can access any class)
  const classWhere = session.user.role === "ADMIN" ? { id } : { id, teacherId: session.user.id };
  const classData = await db.class.findUnique({
    where: classWhere,
    select: { id: true },
  });

  if (!classData) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const enrollments = await db.classEnrollment.findMany({
    where: { classId: id },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          grade: true,
          tutoringSessions: {
            where: { classId: id },
            select: {
              id: true,
              duration: true,
              startedAt: true,
              status: true,
              _count: { select: { messages: true } },
            },
            orderBy: { startedAt: "desc" },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const students = enrollments.map((e) => {
    const sessions = e.student.tutoringSessions;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
    const totalMessages = sessions.reduce((sum, s) => sum + s._count.messages, 0);
    const lastActive = sessions[0]?.startedAt ?? null;

    return {
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
      grade: e.student.grade,
      joinedAt: e.joinedAt,
      sessionCount: sessions.length,
      totalDuration,
      totalMessages,
      lastActive,
    };
  });

  return NextResponse.json(students);
}
