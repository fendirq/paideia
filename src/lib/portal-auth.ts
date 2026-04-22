import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// __Host- prefix: the browser enforces Path=/, Secure, no Domain=.
// This prevents a subdomain (or attacker who controls one) from
// setting or reading this cookie. Required attributes are all already
// in portalCookieHeader(), so the prefix is a pure hardening step.
const COOKIE_NAME = "__Host-portal_access";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const COOKIE_MAX_AGE_MS = COOKIE_MAX_AGE_SECONDS * 1000;

// Signing keys the cookie accepts. The primary key always signs new
// cookies; additional keys only verify existing ones. This lets us rotate
// NEXTAUTH_SECRET without invalidating every active portal session at once.
// NEXTAUTH_SECRET_PREVIOUS is optional and exists for that rotation
// window; absent in steady state.
function resolveSigningKeys(): { primary: string; additional: string[] } {
  const primary = process.env.NEXTAUTH_SECRET;
  if (!primary) {
    throw new Error("NEXTAUTH_SECRET is required to sign portal access cookies");
  }
  const previous = process.env.NEXTAUTH_SECRET_PREVIOUS;
  return { primary, additional: previous ? [previous] : [] };
}

function sign(secret: string, timestamp: string): string {
  const hmac = createHmac("sha256", secret);
  hmac.update(`portal-access|${timestamp}`);
  return hmac.digest("hex");
}

export function validatePortalCode(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  const expected = process.env.PORTAL_ACCESS_CODE;
  if (!expected) return false;
  // Hash both sides to sha256 (32 bytes, constant length) before
  // comparing. Fixed-length allocation with Buffer.alloc(64) + .write()
  // silently truncated anything longer, which let same-length inputs
  // that only matched on the first 64 bytes pass.
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

/**
 * Build a cryptographically signed portal-access cookie value.
 *
 * Format: `<timestamp>.<hex-hmac>` where the hmac is
 * `HMAC-SHA256(NEXTAUTH_SECRET, "portal-access|<timestamp>")`. A user
 * cannot forge this without knowing the server secret, and the timestamp
 * prevents indefinite replay (see `verifyPortalToken`).
 */
export function buildPortalToken(): string {
  const { primary } = resolveSigningKeys();
  const timestamp = Date.now().toString();
  return `${timestamp}.${sign(primary, timestamp)}`;
}

/**
 * Verify a portal-access cookie value produced by `buildPortalToken`.
 *
 * Rejects: malformed tokens, expired tokens (> 7 days), tokens with a
 * signature that does not match the current or previous secret.
 * Comparison is timing-safe.
 */
export function verifyPortalToken(value: string | undefined): boolean {
  if (!value || typeof value !== "string") return false;
  const dot = value.indexOf(".");
  if (dot <= 0 || dot === value.length - 1) return false;
  const timestamp = value.slice(0, dot);
  const signature = value.slice(dot + 1);

  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) return false;
  if (Date.now() - issuedAt > COOKIE_MAX_AGE_MS) return false;

  // `Buffer.from(s, "hex")` silently truncates at the first non-hex
  // character and does NOT throw on malformed input. Without a strict
  // format check a cookie like `<ts>.<valid-hmac>xyz` or
  // `<ts>.<valid-hmac>.junk` would decode to the valid prefix and pass
  // timingSafeEqual. HMAC-SHA256 is always 64 lowercase hex chars.
  if (!/^[0-9a-f]{64}$/i.test(signature)) return false;
  const sigBuf = Buffer.from(signature, "hex");
  if (sigBuf.length === 0) return false;

  const { primary, additional } = resolveSigningKeys();
  for (const key of [primary, ...additional]) {
    const expected = Buffer.from(sign(key, timestamp), "hex");
    if (expected.length === sigBuf.length && timingSafeEqual(sigBuf, expected)) {
      return true;
    }
  }
  return false;
}

export async function hasPortalAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyPortalToken(cookieStore.get(COOKIE_NAME)?.value);
}

export function portalCookieHeader(): string {
  return `${COOKIE_NAME}=${buildPortalToken()}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}`;
}

export const PORTAL_COOKIE_NAME = COOKIE_NAME;
