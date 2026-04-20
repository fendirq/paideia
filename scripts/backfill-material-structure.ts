// Backfill the material-structure columns on rows uploaded BEFORE
// the detection pipeline was wired up. Idempotent — re-running
// skips rows that already have `structureExtractedAt` set.
//
// Talks to Postgres directly via node-pg (not Prisma) so the script
// runs cleanly under `node --experimental-strip-types` without the
// path-alias resolution that Prisma's generated client expects.
//
// Usage:
//   # dev DB:
//   set -a && source .env.development.local && set +a && \
//     node --experimental-strip-types \
//     scripts/backfill-material-structure.ts
//
//   # prod DB (hits real data + real Gemini spend; use --dry-run
//   # first, and keep --limit modest):
//   set -a && source .env.local && set +a && \
//     node --experimental-strip-types \
//     scripts/backfill-material-structure.ts --dry-run
//
// Flags:
//   --dry-run              Print counts + per-row plan; don't call Gemini or write DB.
//   --target=file          Only backfill `File` (student inquiry uploads).
//   --target=material      Only backfill `ClassMaterialFile` (teacher class uploads).
//   --target=both          (default) Backfill both tables.
//   --limit=N              Cap total rows processed per table.
//   --concurrency=N        Parallel detection calls in flight (default 3).
//
// Safety:
// - Does NOT require ENABLE_MATERIAL_STRUCTURE — this script IS the
//   backfill; the flag gates the at-upload pathway, not this script.
// - Skips any row where `extractedText` is null/empty or
//   `structureExtractedAt` is already set.
// - Per-row failures log + continue; a single bad row can't block
//   the rest of the batch.

import { Client } from "pg";
import { detectStructure } from "../src/lib/material-structure.ts";

type Target = "file" | "material" | "both";
type TableName = "File" | "ClassMaterialFile";

interface Args {
  dryRun: boolean;
  target: Target;
  limit: number | null;
  concurrency: number;
}

function parseArgs(): Args {
  const args: Args = { dryRun: false, target: "both", limit: null, concurrency: 3 };
  for (const raw of process.argv.slice(2)) {
    if (raw === "--dry-run") args.dryRun = true;
    else if (raw.startsWith("--target=")) {
      const v = raw.slice("--target=".length);
      if (v !== "file" && v !== "material" && v !== "both") {
        console.error(`Invalid --target=${v}; must be file|material|both`);
        process.exit(1);
      }
      args.target = v;
    } else if (raw.startsWith("--limit=")) {
      const n = Number(raw.slice("--limit=".length));
      if (!Number.isFinite(n) || n <= 0) {
        console.error(`Invalid --limit=${raw}`);
        process.exit(1);
      }
      args.limit = n;
    } else if (raw.startsWith("--concurrency=")) {
      const n = Number(raw.slice("--concurrency=".length));
      if (!Number.isFinite(n) || n <= 0) {
        console.error(`Invalid --concurrency=${raw}`);
        process.exit(1);
      }
      args.concurrency = n;
    } else {
      console.error(`Unknown arg: ${raw}`);
      process.exit(1);
    }
  }
  return args;
}

interface PendingRow {
  id: string;
  fileName: string;
  extractedText: string;
}

async function findPending(
  c: Client,
  table: TableName,
  limit: number | null,
): Promise<PendingRow[]> {
  const limitClause = limit ? `LIMIT ${limit}` : "";
  const res = await c.query<{ id: string; fileName: string; extractedText: string }>(
    `SELECT id, "fileName", "extractedText"
     FROM "${table}"
     WHERE "structureExtractedAt" IS NULL
       AND "extractedText" IS NOT NULL
       AND length("extractedText") > 0
     ${limitClause}`,
  );
  return res.rows;
}

interface BackfillStats {
  kindCounts: Record<string, number>;
  failedCount: number;
  processedCount: number;
}

// Circuit-breaker thresholds. Two independent triggers:
//
//   1. CONSECUTIVE — 20 rows in a row fail. Catches the "hard
//      systemic outage" case (bad key, DB down, schema drift).
//      Walked in SUBMISSION order after each slice, not in
//      async-completion order, to make the count deterministic
//      under concurrency > 1.
//
//   2. FAILURE_RATE — once we've processed a minimum sample, if
//      >= X% of all rows-so-far failed, abort. Catches the
//      "flaky systemic" case where 1-in-3 succeeds and keeps
//      resetting the consecutive counter but the run is still
//      burning mostly-wasted Gemini spend.
const CONSECUTIVE_FAILURE_ABORT = 20;
const FAILURE_RATE_MIN_SAMPLES = 20;
const FAILURE_RATE_THRESHOLD = 0.5; // >50% failure rate

// Parameter-properties (`public readonly` in ctor args) aren't
// supported under `node --experimental-strip-types`, so declare +
// assign in the body. Same workaround as GeminiEmptyResponseError.
class SystemicFailureAbort extends Error {
  public readonly table: TableName;
  public readonly reason: string;
  public readonly lastErrClass: string;

  constructor(table: TableName, reason: string, lastErrClass: string) {
    super(
      `Aborting ${table} backfill: ${reason} (last errClass=${lastErrClass}). Investigate and re-run with --dry-run to confirm before continuing.`,
    );
    this.name = "SystemicFailureAbort";
    this.table = table;
    this.reason = reason;
    this.lastErrClass = lastErrClass;
  }
}

function errClass(err: unknown): string {
  if (!err || typeof err !== "object") return typeof err;
  const e = err as { name?: unknown; code?: unknown };
  const name = typeof e.name === "string" ? e.name : "Error";
  const code = typeof e.code === "string" ? `:${e.code}` : "";
  return `${name}${code}`;
}

interface RowOutcome {
  submissionIndex: number;
  success: boolean;
  kind?: string;
  errClass?: string;
}

async function applyBackfill(
  c: Client,
  table: TableName,
  rows: PendingRow[],
  concurrency: number,
  dryRun: boolean,
): Promise<BackfillStats> {
  const stats: BackfillStats = {
    kindCounts: {},
    failedCount: 0,
    processedCount: 0,
  };
  // Walked in submission order after each slice completes — NOT
  // mutated inside the concurrent workers. Fixes the race where
  // increments/resets would otherwise reflect async-completion
  // order rather than true row order.
  let consecutiveFailures = 0;
  let lastErrClass = "";

  for (let i = 0; i < rows.length; i += concurrency) {
    const slice = rows.slice(i, i + concurrency);

    const outcomes: RowOutcome[] = await Promise.all(
      slice.map(async (row, localIdx): Promise<RowOutcome> => {
        const submissionIndex = i + localIdx;
        if (dryRun) {
          return { submissionIndex, success: true };
        }
        try {
          const result = await detectStructure(row.extractedText);
          // detectStructure never throws — a `result.error` still
          // represents a per-row classification failure (e.g.,
          // missing API key, MAX_TOKENS, validator rejection).
          // Treat it as a failure for the circuit-breaker so a
          // flood of same-error rows is caught.
          if (result.error) {
            console.warn(
              `  ${table} ${row.id} classified unknown (model=${result.model} reason="${result.error}")`,
            );
            return {
              submissionIndex,
              success: false,
              errClass: "DetectError",
            };
          }
          await c.query(
            `UPDATE "${table}"
             SET "structureKind"        = $1,
                 "structure"            = $2::jsonb,
                 "structureExtractedAt" = NOW(),
                 "structureModel"       = $3
             WHERE id = $4`,
            [
              result.structure.kind,
              JSON.stringify(result.structure),
              result.model,
              row.id,
            ],
          );
          return {
            submissionIndex,
            success: true,
            kind: result.structure.kind,
          };
        } catch (err) {
          const ec = errClass(err);
          console.error(
            `  ${table} ${row.id} (${row.fileName}) failed (errClass=${ec}):`,
            err instanceof Error ? err.message : err,
          );
          return { submissionIndex, success: false, errClass: ec };
        }
      }),
    );

    // Walk outcomes in submission order so `consecutiveFailures`
    // actually means "consecutive rows in the input" rather than
    // "consecutive Promise resolutions."
    outcomes.sort((a, b) => a.submissionIndex - b.submissionIndex);
    for (const o of outcomes) {
      stats.processedCount++;
      if (o.success) {
        consecutiveFailures = 0;
        if (o.kind) {
          stats.kindCounts[o.kind] = (stats.kindCounts[o.kind] ?? 0) + 1;
        }
      } else {
        stats.failedCount++;
        consecutiveFailures++;
        if (o.errClass) lastErrClass = o.errClass;
      }
    }
    if (stats.processedCount % 10 === 0 || stats.processedCount === rows.length) {
      console.log(
        `  ${table}: ${stats.processedCount}/${rows.length} processed, ${stats.failedCount} failed`,
      );
    }

    // Trigger 1: hard-consecutive (every recent row failed)
    if (consecutiveFailures >= CONSECUTIVE_FAILURE_ABORT) {
      throw new SystemicFailureAbort(
        table,
        `${consecutiveFailures} consecutive failures`,
        lastErrClass,
      );
    }
    // Trigger 2: flaky-systemic (most of the run is failing but
    // interspersed successes kept resetting the consecutive count)
    if (
      stats.processedCount >= FAILURE_RATE_MIN_SAMPLES &&
      stats.failedCount / stats.processedCount >= FAILURE_RATE_THRESHOLD
    ) {
      const pct = (stats.failedCount / stats.processedCount) * 100;
      throw new SystemicFailureAbort(
        table,
        `${stats.failedCount}/${stats.processedCount} rows failed (${pct.toFixed(0)}%)`,
        lastErrClass,
      );
    }
  }
  return stats;
}

async function main(): Promise<void> {
  const args = parseArgs();
  console.log("backfill-material-structure starting with", args);

  if (!process.env.GEMINI_API_KEY && !args.dryRun) {
    console.error("GEMINI_API_KEY is not set — refusing to run (use --dry-run to plan without it)");
    process.exit(1);
  }

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL / DIRECT_URL not set");
    process.exit(1);
  }

  const targets: TableName[] =
    args.target === "both"
      ? ["File", "ClassMaterialFile"]
      : args.target === "file"
        ? ["File"]
        : ["ClassMaterialFile"];

  const client = new Client({ connectionString });
  await client.connect();
  console.log(`connected to ${new URL(connectionString).host}`);

  const summary: Record<string, BackfillStats> = {};
  const startedAt = Date.now();
  let abortedBy: SystemicFailureAbort | null = null;

  try {
    for (const table of targets) {
      console.log(`\n=== ${table} ===`);
      const pending = await findPending(client, table, args.limit);
      console.log(`  pending rows: ${pending.length}`);
      if (pending.length === 0) continue;
      if (args.dryRun) {
        console.log("  dry-run — sample of first 5:");
        for (const r of pending.slice(0, 5)) {
          console.log(
            `    - ${r.id} ${r.fileName} (${r.extractedText.length} chars)`,
          );
        }
        continue;
      }
      try {
        summary[table] = await applyBackfill(
          client,
          table,
          pending,
          args.concurrency,
          args.dryRun,
        );
      } catch (err) {
        if (err instanceof SystemicFailureAbort) {
          abortedBy = err;
          break; // Skip remaining targets too — systemic issue.
        }
        throw err;
      }
    }
  } finally {
    await client.end();
  }

  console.log("\n=== DONE ===");
  console.log(`elapsed: ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
  if (abortedBy) {
    console.error(`\n⚠️  ${abortedBy.message}`);
  }
  for (const [table, stats] of Object.entries(summary)) {
    console.log(
      `  ${table}: ${stats.processedCount} processed, ${stats.failedCount} failed`,
    );
    for (const [kind, n] of Object.entries(stats.kindCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${kind}: ${n}`);
    }
  }
  if (abortedBy) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
