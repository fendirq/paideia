import { db } from "@/lib/db";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

// Probability of pruning stale rows on each call. At ~1% the cleanup
// amortizes across traffic without needing a cron — the index on
// windowStart keeps each sweep cheap. Rows older than PRUNE_AGE_MS
// are provably in a settled window nothing will ever increment again.
const PRUNE_PROBABILITY = 0.01;
const PRUNE_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Sliding-ish-window rate limit. Uses a single Postgres row per
 * `<bucket>:<identifier>` that atomically increments within the
 * active window or resets when the window has expired.
 *
 * Not a true sliding window (which would need a log of individual
 * timestamps) — it's a fixed window with atomic reset. Good enough
 * for brute-force defense and cost control; a burst at the very end
 * of window N plus the start of window N+1 can double the nominal
 * rate. Tune `limit` with that in mind or switch to a token-bucket
 * library if tighter guarantees are needed.
 *
 * On DB failure this helper fails CLOSED — returns allowed=false. A
 * rate-limit infrastructure outage should not silently disable brute
 * force / cost protection. Ops sees the failure via the structured
 * error log.
 */
export async function checkRateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const key = `${bucket}:${identifier}`;
  const now = new Date();
  const windowStartCutoff = new Date(now.getTime() - windowMs);

  try {
    const rows = await db.$queryRaw<
      Array<{ count: number; windowStart: Date }>
    >`
      INSERT INTO "RateLimit" ("id", "windowStart", "count", "updatedAt")
      VALUES (${key}, ${now}, 1, ${now})
      ON CONFLICT ("id") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."windowStart" < ${windowStartCutoff} THEN 1
          ELSE "RateLimit"."count" + 1
        END,
        "windowStart" = CASE
          WHEN "RateLimit"."windowStart" < ${windowStartCutoff} THEN ${now}
          ELSE "RateLimit"."windowStart"
        END,
        "updatedAt" = ${now}
      RETURNING "count", "windowStart"
    `;

    const row = rows[0];
    if (!row) {
      console.error("rate-limit: upsert returned no row", { bucket, identifier });
      return { allowed: false, remaining: 0, resetAt: new Date(now.getTime() + windowMs) };
    }
    const count = Number(row.count);
    const windowStart = new Date(row.windowStart);

    // Amortized stale-row pruning. Fires ~1% of calls so the table
    // does not accumulate rows for one-shot IPs that never return.
    if (Math.random() < PRUNE_PROBABILITY) {
      const pruneCutoff = new Date(now.getTime() - PRUNE_AGE_MS);
      db.$executeRaw`DELETE FROM "RateLimit" WHERE "windowStart" < ${pruneCutoff}`.catch(
        (err) => console.warn("rate-limit: prune failed", { err: String(err) }),
      );
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: new Date(windowStart.getTime() + windowMs),
    };
  } catch (err) {
    console.error("rate-limit: check failed, failing closed", {
      bucket,
      identifier,
      err: err instanceof Error ? { name: err.name, message: err.message } : { message: String(err) },
    });
    return { allowed: false, remaining: 0, resetAt: new Date(now.getTime() + windowMs) };
  }
}

/**
 * Extract a rate-limit identifier from a request. Prefers the
 * left-most value of `x-forwarded-for` (client IP as seen by Vercel's
 * edge), falling back to `x-real-ip`, then the literal string
 * "unknown". Never trust these headers for authorization — they're
 * only used as a rate-limit bucket key.
 */
export function getClientIdentifier(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  // Behind Vercel's edge, x-forwarded-for is always injected. If this
  // fires in prod it means the edge changed behavior or we're being
  // called from an unexpected path — ops should see it. Every
  // header-free request collapses into one shared bucket until fixed,
  // so a burst would lock everyone out.
  console.warn("rate-limit: no client IP header found, using shared bucket");
  return "unknown";
}
