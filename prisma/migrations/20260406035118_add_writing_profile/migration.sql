-- CreateTable
CREATE TABLE "WritingProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teacherProfile" JSONB NOT NULL,
    "selfAssessment" JSONB NOT NULL,
    "writingStyle" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingSample" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WritingProfile_userId_key" ON "WritingProfile"("userId");

-- AddForeignKey
ALTER TABLE "WritingProfile" ADD CONSTRAINT "WritingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingSample" ADD CONSTRAINT "WritingSample_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
