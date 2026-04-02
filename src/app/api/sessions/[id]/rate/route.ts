import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.tutoringSession.update({
    where: { id },
    data: {
      rating,
      ratingComment: comment || null,
      status: "COMPLETED",
      endedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
