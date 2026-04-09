import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { role, school, grade, subjectsTaught } = body;

  if (role !== "STUDENT" && role !== "TEACHER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (!school || typeof school !== "string" || !school.trim()) {
    return NextResponse.json({ error: "School name is required" }, { status: 400 });
  }
  if (school.trim().length > 200) {
    return NextResponse.json({ error: "School name too long" }, { status: 400 });
  }

  if (role === "STUDENT") {
    if (!grade || typeof grade !== "string") {
      return NextResponse.json({ error: "Grade is required" }, { status: 400 });
    }
    const VALID_GRADES = new Set(["11", "12", "Freshman", "Sophomore", "Junior", "Senior"]);
    if (!VALID_GRADES.has(grade)) {
      return NextResponse.json({ error: "Invalid grade" }, { status: 400 });
    }
  }

  if (role === "TEACHER") {
    if (!Array.isArray(subjectsTaught) || subjectsTaught.length === 0) {
      return NextResponse.json({ error: "At least one subject is required" }, { status: 400 });
    }
    const VALID_SUBJECTS = new Set(["MATHEMATICS","ENGLISH","HISTORY","SCIENCE","MANDARIN","HUMANITIES","OTHER"]);
    if (!subjectsTaught.every((s: unknown) => typeof s === "string" && VALID_SUBJECTS.has(s))) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }
  }

  // Check if role is already set (immutable after selection)
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role) {
    return NextResponse.json(
      { error: "Role already set" },
      { status: 409 }
    );
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      role,
      school: school.trim(),
      ...(role === "STUDENT" ? { grade } : { subjectsTaught }),
    },
  });

  return NextResponse.json({ success: true });
}
