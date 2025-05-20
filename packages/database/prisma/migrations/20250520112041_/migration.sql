/*
  Warnings:

  - A unique constraint covering the columns `[templateId]` on the table `AnalyserJob` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('TABLE', 'BAR_CHART', 'LIST_VIEW');

-- AlterTable
ALTER TABLE "AnalyserJob" ADD COLUMN     "templateId" INTEGER;

-- CreateTable
CREATE TABLE "Template" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "TemplateType" NOT NULL DEFAULT 'TABLE',
    "dynamic" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalyserJob_templateId_key" ON "AnalyserJob"("templateId");

-- AddForeignKey
ALTER TABLE "AnalyserJob" ADD CONSTRAINT "AnalyserJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;
