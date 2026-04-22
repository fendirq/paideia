import { NextResponse } from "next/server";
import { validatePortalCode, portalCookieHeader } from "@/lib/portal-auth";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

// Brute-force defense: 10 attempts per 15 min per client IP. Verified
// codes still grant a 7-day cookie, so legitimate users hit this
// endpoint at most a handful of times per fortnight.
const LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  const ip = getClientIdentifier(req);
  const rl = await checkRateLimit("portal-verify", ip, LIMIT, WINDOW_MS);
  if (!rl.allowed) {
    console.warn("portal.verify-code: rate limit exceeded", { ip });
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt.getTime() - Date.now()) / 1000)) } },
    );
  }

  const body = await req.json();
  const { code } = body;

  if (!validatePortalCode(code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", portalCookieHeader());
  return res;
}
