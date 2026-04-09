import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Subject } from "@/generated/prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const classWhere = session.user.role === "ADMIN" ? { id } : { id, teacherId: session.user.id };
  const classData = await db.class.findUnique({
    where: classWhere,
    include: {
      enrollments: {
        include: {
          student: { select: { id: true, name: true, email: true, school: true, grade: true } },
        },
        orderBy: { joinedAt: "desc" },
      },
      _count: { select: { enrollments: true, sessions: true } },
    },
  });

  if (!classData) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  return NextResponse.json(classData);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, subject, description } = await req.json();

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Class name must be a non-empty string" }, { status: 400 });
    }
    if (name.trim().length > 200) {
      return NextResponse.json({ error: "Class name too long" }, { status: 400 });
    }
  }
  if (subject !== undefined) {
    const VALID_SUBJECTS = new Set<string>(["MATHEMATICS","ENGLISH","HISTORY","SCIENCE","MANDARIN","HUMANITIES","OTHER"]);
    if (!VALID_SUBJECTS.has(subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }
  }
  if (description !== undefined && typeof description === "string" && description.trim().length > 1000) {
    return NextResponse.json({ error: "Description too long" }, { status: 400 });
  }

  try {
    const patchWhere = session.user.role === "ADMIN" ? { id } : { id, teacherId: session.user.id };
    const updated = await db.class.update({
      where: patchWhere,
      data: {
        ...(name !== undefined && { name: (name as string).trim() }),
        ...(subject !== undefined && { subject: subject as Subject }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "P2025") return NextResponse.json({ error: "Class not found" }, { status: 404 });
    throw e;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deleteWhere = session.user.role === "ADMIN" ? { id } : { id, teacherId: session.user.id };
    await db.class.delete({
      where: deleteWhere,
    });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "P2025") return NextResponse.json({ error: "Class not found" }, { status: 404 });
    throw e;
  }
}
