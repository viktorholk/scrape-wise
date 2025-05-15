import { Request, Response } from "express";
import {  createCrawlJob } from "@/lib/crawler";
import { Router } from "express";
import { BadRequestError } from "@/lib/errors";
import { requestHandler } from "@/lib/utils";
import { authMiddleware } from "@/middlewares/auth";
import { createAnalyseJob } from "@/lib/analyser";
const router = Router();

router.post('/', authMiddleware, requestHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { url, prompt, depth, limit } = req.body;

  if (!url) {
    throw new BadRequestError("URL is required");
  }

  const crawlerJob = await createCrawlJob(userId, url, { depth: depth ?? 3, limit: limit ?? 15 });

  const analyserJob = await createAnalyseJob(userId, crawlerJob.id, prompt ?? "");

  res.status(201).json({
    crawlerJob,
    analyserJob,
  });
}));

export default router;
