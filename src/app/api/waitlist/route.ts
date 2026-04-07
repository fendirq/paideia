import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return null;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { phone } = body;

  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const normalized = normalizePhone(phone);
  if (!normalized) {
    return NextResponse.json({ error: "Enter a valid 10-digit US phone number" }, { status: 400 });
  }

  try {
    await db.waitlistEntry.create({ data: { phone: normalized } });
  } catch (err) {
    // P2002 = unique constraint — already on waitlist
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ success: true, alreadyOnList: true });
    }
    throw err;
  }

  return NextResponse.json({ success: true });
}
