-- CreateEnum
CREATE TYPE "CrawlerJobStatus" AS ENUM ('STARTED', 'COMPLETED', 'ERROR');

-- CreateTable
CREATE TABLE "CrawlerJob" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "initialUrl" TEXT NOT NULL,
    "crawlDepth" INTEGER NOT NULL,
    "pageLimit" INTEGER NOT NULL,
    "status" "CrawlerJobStatus" NOT NULL DEFAULT 'STARTED',
    "results" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrawlerJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrawlerJob_userId_idx" ON "CrawlerJob"("userId");

-- AddForeignKey
ALTER TABLE "CrawlerJob" ADD CONSTRAINT "CrawlerJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
