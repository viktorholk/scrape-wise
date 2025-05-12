import { Request, Response } from "express";
import { crawl } from "@/lib/crawler";
import { Router } from "express";
import { BadRequestError } from "@/lib/errors";
import { requestHandler } from "@/lib/utils";
import { prisma, CrawlerJobStatus } from "@/lib/database";
import { authMiddleware } from "@/middlewares/auth";
const router = Router();

async function executeCrawlAndUpdateJob(
  jobId: number,
  url: string,
  depth?: number,
  limit?: number
) {
  try {
    console.log(`Starting crawl for job ID: ${jobId}, URL: ${url}`);
    const crawlResults = await crawl({
      url,
      depth: depth === undefined ? 3 : depth,
      limit: limit === undefined ? 10 : limit
    });

    await prisma.crawlerJob.update({
      where: { id: jobId },
      data: {
        results: crawlResults as any,
        status: CrawlerJobStatus.COMPLETED,
      },
    });
    console.log(`Crawl job ID: ${jobId} completed successfully.`);
  } catch (error: any) {
    console.error(`Error during crawl for job ID: ${jobId}:`, error);
    await prisma.crawlerJob.update({
      where: { id: jobId },
      data: {
        status: CrawlerJobStatus.ERROR,
        results: { error: error.message, details: error.stack } as any,
      },
    });
  }
}

router.post('/', authMiddleware, requestHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { url, depth, limit } = req.body;

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

  executeCrawlAndUpdateJob(newJob.id, url, depth, limit);

}));

export default router;
