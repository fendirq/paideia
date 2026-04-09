import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.set("portal_access", "", { path: "/", maxAge: 0, httpOnly: true, secure: true });
  res.cookies.set("waitlist_access", "", { path: "/", maxAge: 0, httpOnly: true, secure: true });
  return res;
}
