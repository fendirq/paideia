-- CreateEnum
CREATE TYPE "StudyStatus" AS ENUM ('NEW', 'REVIEW', 'PRACTICED');

-- AlterTable
ALTER TABLE "TutoringSession" ADD COLUMN     "duration" INTEGER;

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "topics" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyItem" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "examId" TEXT,
    "topic" TEXT NOT NULL,
    "chapter" TEXT,
    "status" "StudyStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyItem" ADD CONSTRAINT "StudyItem_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyItem" ADD CONSTRAINT "StudyItem_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
