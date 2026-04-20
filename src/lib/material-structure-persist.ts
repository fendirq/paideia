// DB-side of material-structure detection: the persist helpers that
// the upload pipeline calls alongside embedding. Kept in a separate
// module from `material-structure.ts` (which is pure detection logic
// + types + validator) so scripts that only need detection — the
// probe, tests, anything running under node --experimental-strip-types
// without a bundler — don't pull the Prisma client transitively.

import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { detectStructure, isMaterialStructureEnabled } from "./material-structure";

function errClass(err: unknown): string {
  if (!err || typeof err !== "object") return typeof err;
  // Prisma wraps its errors as PrismaClientKnownRequestError /
  // PrismaClientValidationError / etc. — `name` + `code` are the
  // useful discriminators vs Gemini SDK errors (class name contains
  // "GoogleGenAI" or similar) vs plain `Error`.
  const anyErr = err as { name?: unknown; code?: unknown };
  const name = typeof anyErr.name === "string" ? anyErr.name : "Error";
  const code = typeof anyErr.code === "string" ? `:${anyErr.code}` : "";
  return `${name}${code}`;
}

async function runAndPersist(
  fileId: string,
  rawText: string,
  logLabel: string,
  persistFn: (data: {
    structureKind: string;
    structure: Prisma.InputJsonValue;
    structureExtractedAt: Date;
    structureModel: string;
  }) => Promise<unknown>,
): Promise<void> {
  if (!isMaterialStructureEnabled()) return;

  // Detection failures are self-contained inside detectStructure —
  // it NEVER throws; any internal error becomes `result.error` + a
  // `{ kind: "unknown" }` fallback. We still persist that unknown
  // so the column isn't indistinguishable from "never ran."
  const result = await detectStructure(rawText).catch((err) => {
    // Defense-in-depth: if detectStructure ever changes to throw,
    // we still produce an unknown-with-error shape so the persist
    // step has something to write + log.
    return {
      structure: { kind: "unknown" as const },
      model: "unknown",
      elapsedMs: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  });

  if (result.error) {
    console.warn(
      `material-structure: ${logLabel} ${fileId} classified unknown (model=${result.model} reason="${result.error}")`,
    );
  }

  try {
    await persistFn({
      structureKind: result.structure.kind,
      structure: result.structure as unknown as Prisma.InputJsonValue,
      structureExtractedAt: new Date(),
      structureModel: result.model,
    });
  } catch (err) {
    // Separate from the detection log above so ops can tell
    // "Gemini flaky" (warn above + no error here) apart from
    // "schema drift / DB down" (error here) at a glance.
    console.error(
      `material-structure: ${logLabel} ${fileId} DB persist failed (errClass=${errClass(err)} model=${result.model} kind=${result.structure.kind})`,
      err,
    );
  }
}

/**
 * Detect structure for an Inquiry-uploaded `File` and persist onto
 * the row's structure* columns. Never throws; errors are logged.
 */
export async function detectAndPersistStructureForFile(
  fileId: string,
  rawText: string,
): Promise<void> {
  await runAndPersist(fileId, rawText, "File", (data) =>
    db.file.update({ where: { id: fileId }, data }),
  );
}

/**
 * Detect structure for a teacher-uploaded `ClassMaterialFile` and
 * persist onto the row's structure* columns. Never throws.
 */
export async function detectAndPersistStructureForMaterialFile(
  fileId: string,
  rawText: string,
): Promise<void> {
  await runAndPersist(fileId, rawText, "ClassMaterialFile", (data) =>
    db.classMaterialFile.update({ where: { id: fileId }, data }),
  );
}
