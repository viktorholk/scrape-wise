/*
  Warnings:

  - You are about to drop the column `templateId` on the `AnalyserJob` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[analyserJobId]` on the table `Template` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Template` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `analyserJobId` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AnalyserJob" DROP CONSTRAINT "AnalyserJob_templateId_fkey";

-- DropIndex
DROP INDEX "AnalyserJob_templateId_key";

-- AlterTable
ALTER TABLE "AnalyserJob" DROP COLUMN "templateId";

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "analyserJobId" INTEGER NOT NULL,
ADD COLUMN     "index" INTEGER,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Template_analyserJobId_key" ON "Template"("analyserJobId");

-- CreateIndex
CREATE UNIQUE INDEX "Template_userId_key" ON "Template"("userId");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_analyserJobId_fkey" FOREIGN KEY ("analyserJobId") REFERENCES "AnalyserJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
