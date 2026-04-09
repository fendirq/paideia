import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db.inquiry.findMany({
    where: { userId: session.user.id },
    select: { id: true, unitName: true, teacherName: true, subject: true, teacherNotes: true },
    orderBy: { updatedAt: "desc" },
  });

  // Only return classes created via Add a Class form
  const classes = all.filter((c) => c.teacherNotes === "add-class");

  return NextResponse.json({ classes });
}
