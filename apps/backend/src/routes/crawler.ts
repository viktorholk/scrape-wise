import { Request, Response } from "express";
import { crawl, CrawlerProps, executeCrawlAndUpdateJob } from "@/lib/crawler";
import { Router } from "express";
import { BadRequestError } from "@/lib/errors";
import { requestHandler } from "@/lib/utils";
import { prisma, CrawlerJobStatus } from "@packages/database";
import { authMiddleware } from "@/middlewares/auth";
const router = Router();

router.post('/', authMiddleware, requestHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { url, prompt, depth, limit } = req.body;

  if (!url) {
    throw new BadRequestError("URL is required");
  }

  const newJob = await prisma.crawlerJob.create({
    data: {
      userId: userId,
      initialUrl: url,
      crawlDepth: depth === undefined ? 3 : depth,
      pageLimit: limit === undefined ? 10 : limit,
      status: CrawlerJobStatus.STARTED,
    },
  });


  res.status(202).json({
    message: "Crawl job accepted and started.",
    jobId: newJob.id
  });

  executeCrawlAndUpdateJob({ userId, jobId: newJob.id, url, prompt, settings: { depth: depth ?? 3, limit: limit ?? 3 } });

}));

router.post('/process-results', authMiddleware, requestHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { jobId, prompt } = req.body;

  const job = await prisma.crawlerJob.findUnique({ where: { userId, id: jobId, status: { in: [CrawlerJobStatus.COMPLETED, CrawlerJobStatus.STOPPED] } } });

  if (!job) {
    throw new BadRequestError("Job not found or not completed");
  }


}));

export default router;
