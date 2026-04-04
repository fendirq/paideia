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

  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id },
    include: {
      inquiry: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tutoringSession);
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

  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.$transaction([
    db.message.deleteMany({ where: { sessionId: id } }),
    db.tutoringSession.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
