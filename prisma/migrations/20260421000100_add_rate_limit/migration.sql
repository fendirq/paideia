-- Per-bucket-per-identifier sliding-window rate limiting backed by a
-- single Postgres row. Keyed by `<bucket>:<identifier>` so one table
-- covers all endpoints. Atomic upsert in the helper resets windowStart
-- when the previous window has expired, otherwise increments count.
--
-- Index on windowStart lets a periodic sweep prune expired rows
-- cheaply (not hot-path — helper ignores stale rows inline).

-- CreateTable
CREATE TABLE "RateLimit" (
  "id"          TEXT         NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "count"       INTEGER      NOT NULL,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");
