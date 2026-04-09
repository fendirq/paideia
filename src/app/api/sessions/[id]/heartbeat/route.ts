import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id },
    select: { userId: true, startedAt: true, status: true },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (tutoringSession.status !== "ACTIVE") {
    return NextResponse.json({ error: "Session is not active" }, { status: 400 });
  }

  const now = new Date();
  const duration = Math.floor((now.getTime() - tutoringSession.startedAt.getTime()) / 1000);

  await db.tutoringSession.update({
    where: { id },
    data: { duration },
  });

  return NextResponse.json({ duration });
}
