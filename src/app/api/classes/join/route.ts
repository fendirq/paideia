import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "STUDENT" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { joinCode } = await req.json();

  if (!joinCode || typeof joinCode !== "string") {
    return NextResponse.json({ error: "Join code is required" }, { status: 400 });
  }

  const classData = await db.class.findUnique({
    where: { joinCode: joinCode.toUpperCase().trim() },
    select: {
      id: true,
      name: true,
      subject: true,
      teacher: { select: { name: true } },
    },
  });

  if (!classData) {
    return NextResponse.json({ error: "Invalid join code" }, { status: 404 });
  }

  try {
    await db.classEnrollment.create({
      data: {
        classId: classData.id,
        studentId: session.user.id,
      },
    });
  } catch (e: unknown) {
    const prismaErr = e as { code?: string };
    if (prismaErr.code === "P2002") {
      return NextResponse.json({ error: "You're already enrolled in this class" }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({
    classId: classData.id,
    className: classData.name,
    subject: classData.subject,
    teacherName: classData.teacher?.name ?? null,
  });
}
