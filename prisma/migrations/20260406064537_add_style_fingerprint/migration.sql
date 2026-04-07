-- AlterTable
ALTER TABLE "WritingProfile" ADD COLUMN     "styleFingerprint" JSONB,
ALTER COLUMN "writingStyle" DROP NOT NULL;
