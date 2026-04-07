import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "portal_access";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function validatePortalCode(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const expected = process.env.PORTAL_ACCESS_CODE;
  if (!expected) return false;
  // Fixed-length buffers to prevent timing leak on length mismatch
  const a = Buffer.alloc(64);
  const b = Buffer.alloc(64);
  a.write(input);
  b.write(expected);
  return input.length === expected.length && timingSafeEqual(a, b);
}

export async function hasPortalAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === "granted";
}

export function portalCookieHeader(): string {
  return `${COOKIE_NAME}=granted; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`;
}
