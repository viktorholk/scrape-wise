/*
  Warnings:

  - You are about to drop the column `analyserJobId` on the `ScheduledAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `crawlerJobId` on the `ScheduledAnalysis` table. All the data in the column will be lost.
  - Added the required column `originalCrawlerJobId` to the `ScheduledAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AnalyserJob" DROP CONSTRAINT "AnalyserJob_crawlerJobId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledAnalysis" DROP CONSTRAINT "ScheduledAnalysis_analyserJobId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledAnalysis" DROP CONSTRAINT "ScheduledAnalysis_crawlerJobId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduledAnalysis" DROP CONSTRAINT "ScheduledAnalysis_userId_fkey";

-- AlterTable
ALTER TABLE "AnalyserJob" ADD COLUMN     "createdByScheduledAnalysisId" INTEGER;

-- AlterTable
ALTER TABLE "ScheduledAnalysis" DROP COLUMN "analyserJobId",
DROP COLUMN "crawlerJobId",
ADD COLUMN     "lastRunStatus" "JobStatus",
ADD COLUMN     "originalCrawlerJobId" INTEGER NOT NULL,
ALTER COLUMN "enabled" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "AnalyserJob_crawlerJobId_idx" ON "AnalyserJob"("crawlerJobId");

-- CreateIndex
CREATE INDEX "AnalyserJob_createdByScheduledAnalysisId_idx" ON "AnalyserJob"("createdByScheduledAnalysisId");

-- CreateIndex
CREATE INDEX "ScheduledAnalysis_userId_enabled_idx" ON "ScheduledAnalysis"("userId", "enabled");

-- AddForeignKey
ALTER TABLE "AnalyserJob" ADD CONSTRAINT "AnalyserJob_crawlerJobId_fkey" FOREIGN KEY ("crawlerJobId") REFERENCES "CrawlerJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyserJob" ADD CONSTRAINT "AnalyserJob_createdByScheduledAnalysisId_fkey" FOREIGN KEY ("createdByScheduledAnalysisId") REFERENCES "ScheduledAnalysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledAnalysis" ADD CONSTRAINT "ScheduledAnalysis_originalCrawlerJobId_fkey" FOREIGN KEY ("originalCrawlerJobId") REFERENCES "CrawlerJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledAnalysis" ADD CONSTRAINT "ScheduledAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
