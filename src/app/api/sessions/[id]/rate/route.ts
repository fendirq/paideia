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

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be an integer 1-5" }, { status: 400 });
  }
  if (comment != null && (typeof comment !== "string" || comment.length > 2000)) {
    return NextResponse.json({ error: "Comment must be under 2000 characters" }, { status: 400 });
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
