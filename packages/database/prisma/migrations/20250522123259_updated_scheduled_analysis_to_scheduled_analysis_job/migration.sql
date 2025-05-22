/*
  Warnings:

  - You are about to drop the `ScheduledAnalysis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AnalyserJob" DROP CONSTRAINT "AnalyserJob_createdByScheduledAnalysisId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledAnalysis" DROP CONSTRAINT "ScheduledAnalysis_originalCrawlerJobId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledAnalysis" DROP CONSTRAINT "ScheduledAnalysis_userId_fkey";

-- DropTable
DROP TABLE "ScheduledAnalysis";

-- CreateTable
CREATE TABLE "ScheduledAnalysisJob" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "index" INTEGER,
    "originalCrawlerJobId" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "lastRunStatus" "JobStatus",
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledAnalysisJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledAnalysisJob_userId_enabled_idx" ON "ScheduledAnalysisJob"("userId", "enabled");

-- AddForeignKey
ALTER TABLE "AnalyserJob" ADD CONSTRAINT "AnalyserJob_createdByScheduledAnalysisId_fkey" FOREIGN KEY ("createdByScheduledAnalysisId") REFERENCES "ScheduledAnalysisJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledAnalysisJob" ADD CONSTRAINT "ScheduledAnalysisJob_originalCrawlerJobId_fkey" FOREIGN KEY ("originalCrawlerJobId") REFERENCES "CrawlerJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledAnalysisJob" ADD CONSTRAINT "ScheduledAnalysisJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
