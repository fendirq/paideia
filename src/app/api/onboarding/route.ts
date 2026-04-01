import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.id === "guest") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const role = body.role;

  if (role !== "STUDENT" && role !== "TEACHER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
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
    data: { role },
  });

  return NextResponse.json({ success: true });
}
