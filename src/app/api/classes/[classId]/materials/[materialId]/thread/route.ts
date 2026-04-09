import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ classId: string; materialId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId, materialId } = await params;

  // Verify enrollment
  const enrollment = await db.classEnrollment.findUnique({
    where: { classId_studentId: { classId, studentId: session.user.id } },
  });

  if (!enrollment && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  // Verify material belongs to class
  const material = await db.classMaterial.findUnique({
    where: { id: materialId, classId },
  });

  if (!material) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  // Check for existing thread
  const existing = await db.tutoringSession.findFirst({
    where: { userId: session.user.id, materialId, classId },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ sessionId: existing.id, resumed: true });
  }

  // Create new thread (catch duplicate from race condition)
  try {
    const newSession = await db.tutoringSession.create({
      data: {
        userId: session.user.id,
        classId,
        materialId,
        helpType: material.title,
        status: "ACTIVE",
      },
    });
    return NextResponse.json({ sessionId: newSession.id, resumed: false }, { status: 201 });
  } catch (e: unknown) {
    // Only attempt recovery on unique constraint violation (race condition)
    const code = (e as { code?: string }).code;
    if (code === "P2002") {
      const raced = await db.tutoringSession.findFirst({
        where: { userId: session.user.id, materialId, classId },
        select: { id: true },
      });
      if (raced) {
        return NextResponse.json({ sessionId: raced.id, resumed: true });
      }
    }
    throw e;
  }
}
