import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "STUDENT" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enrollments = await db.classEnrollment.findMany({
    where: { studentId: session.user.id },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          subject: true,
          teacher: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const classes = enrollments.map((e) => ({
    id: e.class.id,
    name: e.class.name,
    subject: e.class.subject,
    teacherName: e.class.teacher?.name ?? null,
    studentCount: e.class._count.enrollments,
    joinedAt: e.joinedAt,
  }));

  return NextResponse.json(classes);
}
