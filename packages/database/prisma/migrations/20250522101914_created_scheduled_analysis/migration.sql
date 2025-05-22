-- CreateTable
CREATE TABLE "ScheduledAnalysis" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "index" INTEGER,
    "crawlerJobId" INTEGER NOT NULL,
    "analyserJobId" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "scheduleInMinutes" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledAnalysis_analyserJobId_key" ON "ScheduledAnalysis"("analyserJobId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledAnalysis_userId_key" ON "ScheduledAnalysis"("userId");

-- AddForeignKey
ALTER TABLE "ScheduledAnalysis" ADD CONSTRAINT "ScheduledAnalysis_crawlerJobId_fkey" FOREIGN KEY ("crawlerJobId") REFERENCES "CrawlerJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledAnalysis" ADD CONSTRAINT "ScheduledAnalysis_analyserJobId_fkey" FOREIGN KEY ("analyserJobId") REFERENCES "AnalyserJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledAnalysis" ADD CONSTRAINT "ScheduledAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
