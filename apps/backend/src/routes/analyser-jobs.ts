
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
        return prisma.analyserJob.findMany({
          where: { userId },
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            prompt: true,
            crawlerJob: true,
            createdByScheduledAnalysis: true,
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


  export default router;