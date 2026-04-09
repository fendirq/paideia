import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.alloc(64);
  const bufB = Buffer.alloc(64);
  bufA.write(a);
  bufB.write(b);
  return a.length === b.length && timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const validCode = process.env.WAITLIST_CODE;
  if (!validCode) {
    return NextResponse.json({ error: "Waitlist not configured" }, { status: 500 });
  }

  if (!safeCompare(code.trim().toUpperCase(), validCode.toUpperCase())) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("waitlist_access", "granted", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 days
  });
  return res;
}
