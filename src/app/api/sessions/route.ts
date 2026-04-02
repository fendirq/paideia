import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inquiryId } = await req.json();
  if (!inquiryId) {
    return NextResponse.json({ error: "inquiryId required" }, { status: 400 });
  }

  const inquiry = await db.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry || inquiry.userId !== session.user.id) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const tutoringSession = await db.tutoringSession.create({
    data: {
      userId: session.user.id,
      inquiryId,
    },
  });

  return NextResponse.json(tutoringSession, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await db.tutoringSession.findMany({
    where: { userId: session.user.id },
    include: {
      inquiry: {
        select: { subject: true, unitName: true, teacherName: true },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(sessions);
}
