import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Subject } from "@/generated/prisma/client";

const ESSAY_SUBJECTS = new Set<string>([Subject.HISTORY, Subject.ENGLISH, Subject.HUMANITIES]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classes = await db.portalClass.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, subject: true },
  });

  return NextResponse.json({ classes });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, subject } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Class name is required" }, { status: 400 });
  }
  if (name.length > 100) {
    return NextResponse.json({ error: "Class name too long" }, { status: 400 });
  }
  if (!subject || !ESSAY_SUBJECTS.has(subject)) {
    return NextResponse.json({ error: "Subject must be History, English, or Humanities" }, { status: 400 });
  }

  const created = await db.portalClass.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      subject: subject as Subject,
    },
    select: { id: true, name: true, subject: true },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
  }

  const existing = await db.portalClass.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.portalClass.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
