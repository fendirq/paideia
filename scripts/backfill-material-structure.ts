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

async function applyBackfill(
  c: Client,
  table: TableName,
  rows: PendingRow[],
  concurrency: number,
  dryRun: boolean,
): Promise<Record<string, number>> {
  const kindCounts: Record<string, number> = {};
  let done = 0;
  for (let i = 0; i < rows.length; i += concurrency) {
    const slice = rows.slice(i, i + concurrency);
    await Promise.all(
      slice.map(async (row) => {
        try {
          if (dryRun) {
            done++;
            return;
          }
          const result = await detectStructure(row.extractedText);
          const kind = result.structure.kind;
          kindCounts[kind] = (kindCounts[kind] ?? 0) + 1;
          await c.query(
            `UPDATE "${table}"
             SET "structureKind"        = $1,
                 "structure"            = $2::jsonb,
                 "structureExtractedAt" = NOW(),
                 "structureModel"       = $3
             WHERE id = $4`,
            [kind, JSON.stringify(result.structure), result.model, row.id],
          );
          done++;
          if (done % 10 === 0 || done === rows.length) {
            console.log(
              `  ${table}: ${done}/${rows.length} processed (last kind=${kind})`,
            );
          }
        } catch (err) {
          console.error(
            `  ${table} ${row.id} (${row.fileName}) failed:`,
            err instanceof Error ? err.message : err,
          );
        }
      }),
    );
  }
  return kindCounts;
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

  const summary: Record<string, Record<string, number>> = {};
  const startedAt = Date.now();

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
      summary[table] = await applyBackfill(
        client,
        table,
        pending,
        args.concurrency,
        args.dryRun,
      );
    }
  } finally {
    await client.end();
  }

  console.log("\n=== DONE ===");
  console.log(`elapsed: ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
  console.log("kind distribution by table:");
  for (const [table, counts] of Object.entries(summary)) {
    console.log(`  ${table}:`);
    for (const [kind, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${kind}: ${n}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
