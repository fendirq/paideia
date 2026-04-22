import { NextResponse } from "next/server";
import { PORTAL_COOKIE_NAME } from "@/lib/portal-auth";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.set(PORTAL_COOKIE_NAME, "", { path: "/", maxAge: 0, httpOnly: true, secure: true });
  return res;
}
