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

  if (!inquiry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (inquiry.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(inquiry);
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

  // Delete in order: messages → sessions → chunks → files → inquiry
  const sessions = await db.tutoringSession.findMany({
    where: { inquiryId: id },
    select: { id: true },
  });
  if (sessions.length > 0) {
    await db.message.deleteMany({
      where: { sessionId: { in: sessions.map((s) => s.id) } },
    });
    await db.tutoringSession.deleteMany({ where: { inquiryId: id } });
  }
  await db.textChunk.deleteMany({ where: { inquiryId: id } });
  await db.file.deleteMany({ where: { inquiryId: id } });
  await db.inquiry.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
