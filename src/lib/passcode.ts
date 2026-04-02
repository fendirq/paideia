import { timingSafeEqual } from "crypto";

export function validatePasscode(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
