// DB-side of material-structure detection: the persist helpers that
// the upload pipeline calls alongside embedding. Kept in a separate
// module from `material-structure.ts` (which is pure detection logic
// + types + validator) so scripts that only need detection — the
// probe, tests, anything running under node --experimental-strip-types
// without a bundler — don't pull the Prisma client transitively.

import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { detectStructure, isMaterialStructureEnabled } from "./material-structure";

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
  try {
    const result = await detectStructure(rawText);
    await persistFn({
      structureKind: result.structure.kind,
      structure: result.structure as unknown as Prisma.InputJsonValue,
      structureExtractedAt: new Date(),
      structureModel: result.model,
    });
    if (result.error) {
      console.warn(
        `material-structure: ${logLabel} ${fileId} classified as unknown (${result.error})`,
      );
    }
  } catch (err) {
    console.error(
      `material-structure: ${logLabel} ${fileId} persist failed`,
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
