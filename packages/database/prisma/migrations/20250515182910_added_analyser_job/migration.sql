/*
  Warnings:

  - The `status` column on the `CrawlerJob` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `imageUrl` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUrl` on the `Recipe` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('STARTED', 'COMPLETED', 'STOPPED', 'ERROR');

-- AlterTable
ALTER TABLE "CrawlerJob" DROP COLUMN "status",
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'STARTED';

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "imageUrl",
DROP COLUMN "sourceUrl";

-- DropEnum
DROP TYPE "CrawlerJobStatus";

-- CreateTable
CREATE TABLE "AnalyserJob" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "crawlerJobId" INTEGER NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'STARTED',
    "results" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyserJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyserJob_userId_idx" ON "AnalyserJob"("userId");

-- AddForeignKey
ALTER TABLE "AnalyserJob" ADD CONSTRAINT "AnalyserJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyserJob" ADD CONSTRAINT "AnalyserJob_crawlerJobId_fkey" FOREIGN KEY ("crawlerJobId") REFERENCES "CrawlerJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
