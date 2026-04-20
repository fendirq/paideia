-- Add material-structure detection columns to both uploaded-file models.
-- Populated once at upload by src/lib/material-structure.ts; read at
-- tutor runtime to adapt output format (numbered walkthroughs,
-- question-scoped responses, etc.).
--
-- All nullable so detection failure or legacy rows do not break the
-- upload pipeline or existing queries.

-- AlterTable
ALTER TABLE "ClassMaterialFile"
  ADD COLUMN "structure"            JSONB,
  ADD COLUMN "structureExtractedAt" TIMESTAMP(3),
  ADD COLUMN "structureKind"        TEXT,
  ADD COLUMN "structureModel"       TEXT;

-- AlterTable
ALTER TABLE "File"
  ADD COLUMN "structure"            JSONB,
  ADD COLUMN "structureExtractedAt" TIMESTAMP(3),
  ADD COLUMN "structureKind"        TEXT,
  ADD COLUMN "structureModel"       TEXT;
