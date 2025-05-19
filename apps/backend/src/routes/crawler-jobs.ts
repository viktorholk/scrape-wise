import { Request, Response } from "express";
import {  createCrawlJob } from "@/lib/crawler";
import { Router } from "express";
import { BadRequestError } from "@/lib/errors";
import { requestHandler } from "@/lib/utils";
import { authMiddleware } from "@/middlewares/auth";
import { createAnalyseJob } from "@/lib/analyser";
import { AnalyserJob, prisma } from "@packages/database";
import { getPaginationParams, paginateResults } from "@/lib/utils/pagination";

const router = Router();

router.get('/', authMiddleware, requestHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const paginationParams = getPaginationParams(req.query);

  const result = await paginateResults(
    async (skip, take) => {
      return prisma.crawlerJob.findMany({
        where: { userId },
        select: {
          id: true,
          initialUrl: true,
          crawlDepth: true,
          pageLimit: true,
          createdAt: true,
          pages: true,
          status: true,
          analyserJobs: true
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take
      });
    },
    async () => {
      return prisma.crawlerJob.count({
        where: { userId }
      });
    },
    paginationParams
  );

  res.status(200).json(result);
}));

router.post('/', authMiddleware, requestHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { url, prompt, depth, limit } = req.body;

  const { analyse } = req.query;

  if (!url) {
    throw new BadRequestError("URL is required");
  }

  const crawlerJobResult = await createCrawlJob(userId, url, { depth: depth ?? 3, limit: limit ?? 15 });

  let analyserJobResult: AnalyserJob | null = null;

  if (analyse === "true") {
    analyserJobResult = await createAnalyseJob(userId, crawlerJobResult.id, prompt ?? "");
  }

  res.status(201).json({
    crawlerJob: crawlerJobResult,
    ...(analyserJobResult && { analyserJob: analyserJobResult })
  });
}));


router.post(':id/analyse', requestHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { id } = req.params;
  const { prompt } = req.body;

  const analyserJob = await createAnalyseJob(userId, parseInt(id), prompt ?? "");

  res.status(201).json(analyserJob);
}));

export default router;
