import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      school: true,
      grade: true,
      role: true,
      subjectsTaught: true,
      level2PaidAt: true,
      stripeCustomerId: true,
      passwordHash: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    phone: user.phone,
    school: user.school,
    grade: user.grade,
    role: user.role,
    subjectsTaught: user.subjectsTaught,
    hasSubscription: !!user.level2PaidAt,
    hasBillingPortal: !!user.stripeCustomerId,
    hasPassword: !!user.passwordHash,
    createdAt: user.createdAt,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, school, grade, subjectsTaught } = await req.json();

  const VALID_GRADES = new Set(["11", "12", "Freshman", "Sophomore", "Junior", "Senior"]);
  const VALID_SUBJECTS = new Set([
    "MATHEMATICS", "ENGLISH", "HISTORY", "SCIENCE", "MANDARIN", "HUMANITIES", "OTHER",
  ]);

  const data: Record<string, unknown> = {};
  if (name !== undefined) {
    if (typeof name === "string" && name.trim().length > 200) {
      return NextResponse.json({ error: "Name too long" }, { status: 400 });
    }
    data.name = name?.trim() || null;
  }
  if (email !== undefined) {
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    data.email = email.trim().toLowerCase();
  }
  if (school !== undefined) {
    if (typeof school === "string" && school.trim().length > 200) {
      return NextResponse.json({ error: "School name too long" }, { status: 400 });
    }
    data.school = school?.trim() || null;
  }
  if (grade !== undefined) {
    if (grade !== null && !VALID_GRADES.has(grade)) {
      return NextResponse.json({ error: "Invalid grade" }, { status: 400 });
    }
    data.grade = grade || null;
  }
  if (subjectsTaught !== undefined && Array.isArray(subjectsTaught)) {
    if (!subjectsTaught.every((s: unknown) => typeof s === "string" && VALID_SUBJECTS.has(s))) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }
    data.subjectsTaught = subjectsTaught;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data,
    });
  } catch (err) {
    const prismaErr = err as { code?: string };
    if (prismaErr.code === "P2002") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
