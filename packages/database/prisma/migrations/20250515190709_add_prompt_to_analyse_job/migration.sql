/*
  Warnings:

  - Added the required column `prompt` to the `AnalyserJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AnalyserJob" ADD COLUMN     "prompt" TEXT NOT NULL;
