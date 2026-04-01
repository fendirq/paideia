const GUEST_PASSCODE = "082600";

export function validatePasscode(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return input === GUEST_PASSCODE;
}
