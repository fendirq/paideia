import { NextResponse } from "next/server";
import { validatePortalCode, portalCookieHeader } from "@/lib/portal-auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { code } = body;

  if (!validatePortalCode(code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", portalCookieHeader());
  return res;
}
