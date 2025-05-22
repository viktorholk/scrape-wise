/*
  Warnings:

  - You are about to drop the column `scheduleInMinutes` on the `ScheduledAnalysis` table. All the data in the column will be lost.
  - Added the required column `cronExpression` to the `ScheduledAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enabled` to the `ScheduledAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScheduledAnalysis" DROP COLUMN "scheduleInMinutes",
ADD COLUMN     "cronExpression" TEXT NOT NULL,
ADD COLUMN     "enabled" BOOLEAN NOT NULL,
ADD COLUMN     "lastRun" TIMESTAMP(3),
ADD COLUMN     "nextRun" TIMESTAMP(3);
