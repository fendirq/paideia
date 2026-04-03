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

  const inquiry = await db.inquiry.findUnique({ where: { id } });
  if (!inquiry || inquiry.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.inquiry.update({
    where: { id },
    data: {
      teacherNotes:
        typeof body.teacherNotes === "string" ? body.teacherNotes : undefined,
    },
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

  // Atomic delete: messages → sessions → chunks → files → inquiry
  const sessions = await db.tutoringSession.findMany({
    where: { inquiryId: id },
    select: { id: true },
  });

  await db.$transaction([
    ...(sessions.length > 0
      ? [
          db.message.deleteMany({
            where: { sessionId: { in: sessions.map((s) => s.id) } },
          }),
          db.tutoringSession.deleteMany({ where: { inquiryId: id } }),
        ]
      : []),
    db.textChunk.deleteMany({ where: { inquiryId: id } }),
    db.file.deleteMany({ where: { inquiryId: id } }),
    db.inquiry.delete({ where: { id } }),
  ]);

  return NextResponse.json({ success: true });
}
