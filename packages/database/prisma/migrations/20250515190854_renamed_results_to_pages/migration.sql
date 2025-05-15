/*
  Warnings:

  - You are about to drop the column `results` on the `CrawlerJob` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CrawlerJob" DROP COLUMN "results",
ADD COLUMN     "pages" JSONB;
