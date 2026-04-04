import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const inquiry = await db.inquiry.findUnique({
    where: { id },
    include: {
      files: true,
      sessions: {
        select: {
          id: true,
          status: true,
          startedAt: true,
          endedAt: true,
          rating: true,
        },
        orderBy: { startedAt: "desc" },
      },
      _count: { select: { chunks: true } },
    },
  });

  if (!inquiry || inquiry.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(inquiry);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const inquiry = await db.inquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const notes =
    typeof body.teacherNotes === "string"
      ? body.teacherNotes.slice(0, 5000)
      : undefined;

  const updated = await db.inquiry.update({
    where: { id },
    data: { teacherNotes: notes },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const inquiry = await db.inquiry.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!inquiry || inquiry.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Atomic delete: messages → sessions → studyItems → exams → chunks → files → inquiry
  await db.$transaction([
    db.message.deleteMany({ where: { session: { inquiryId: id } } }),
    db.tutoringSession.deleteMany({ where: { inquiryId: id } }),
    db.studyItem.deleteMany({ where: { inquiryId: id } }),
    db.exam.deleteMany({ where: { inquiryId: id } }),
    db.textChunk.deleteMany({ where: { inquiryId: id } }),
    db.file.deleteMany({ where: { inquiryId: id } }),
    db.inquiry.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}
