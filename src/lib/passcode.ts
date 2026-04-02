export function validatePasscode(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) return false;
  return input === expected;
}
