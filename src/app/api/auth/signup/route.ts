import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcrypt";

function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return null;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, phone, password } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!phone || typeof phone !== "string") {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return NextResponse.json({ error: "Enter a valid 10-digit US phone number" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        phone: normalizedPhone,
        passwordHash,
      },
    });
  } catch (e: unknown) {
    const prismaErr = e as { code?: string; meta?: { target?: string[] } };
    if (prismaErr.code === "P2002") {
      const field = prismaErr.meta?.target?.includes("phone") ? "phone number" : "email";
      return NextResponse.json({ error: `An account with this ${field} already exists` }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({ success: true });
}
