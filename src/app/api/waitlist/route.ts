import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@") || !normalized.includes(".")) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  try {
    await db.waitlistEntry.create({ data: { email: normalized } });
  } catch (err) {
    // P2002 = unique constraint — already on waitlist (same response to prevent enumeration)
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ success: true });
    }
    throw err;
  }

  return NextResponse.json({ success: true });
}
