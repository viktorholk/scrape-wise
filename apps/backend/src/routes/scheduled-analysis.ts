import { Request, Response } from "express";
import { Router } from "express";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { requestHandler } from "@/lib/utils";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@packages/database";
import { scheduleJob, updateScheduledJob, unscheduleJob } from "@/lib/scheduler";
import { CronExpressionParser } from 'cron-parser';

const router = Router();

interface CreateScheduledAnalysisJobBody {
  name: string;
  cronExpression: string;
  prompt: string;
  originalCrawlerJobId: number;
}

interface UpdateScheduledAnalysisJobBody {
  name?: string;
  cronExpression?: string;
  prompt?: string;
  enabled?: boolean;
}

router.get(
  '/',
  authMiddleware,
  requestHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    if (!userId) throw new BadRequestError("No user found");
    const scheduledAnalysisJobs = await prisma.scheduledAnalysisJob.findMany({
      where: { userId },
      include: {
        analyserJobRuns: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        originalCrawlerJob: {
          select: {
            initialUrl: true,
          }
        }
      },
      orderBy: { index: "asc" },
    });
    res.status(200).json(scheduledAnalysisJobs);
  })
);

router.post(
  '/',
  authMiddleware,
  requestHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    const {
      name,
      cronExpression,
      prompt,
      originalCrawlerJobId
    } = req.body as CreateScheduledAnalysisJobBody;

    if (!userId) throw new BadRequestError("No user found");

    if (!name || !cronExpression || !prompt || typeof originalCrawlerJobId !== 'number') {
      throw new BadRequestError("Missing required fields: name, cronExpression, prompt, originalCrawlerJobId");
    }

    try {
      CronExpressionParser.parse(cronExpression);
    } catch (e) {
      throw new BadRequestError("Invalid cronExpression format.");
    }

    const templateCrawlerJob = await prisma.crawlerJob.findUnique({
      where: {
        id: originalCrawlerJobId,
        userId: userId,
      },
    });

    if (!templateCrawlerJob) {
      throw new NotFoundError(`Template CrawlerJob with ID ${originalCrawlerJobId} not found or does not belong to the user.`);
    }

    const count = await prisma.scheduledAnalysisJob.count({
      where: { userId },
    });

    const newScheduledAnalysisJob = await prisma.scheduledAnalysisJob.create({
      data: {
        userId,
        index: count,
        name,
        cronExpression,
        enabled: true,
        prompt,
        originalCrawlerJobId: templateCrawlerJob.id,
      },
    });

    scheduleJob(newScheduledAnalysisJob);

    res.status(201).json(newScheduledAnalysisJob);
  })
);

router.put(
  '/:id',
  authMiddleware,
  requestHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    const jobId = parseInt(req.params.id, 10);
    const { name, cronExpression, prompt, enabled } = req.body as UpdateScheduledAnalysisJobBody;

    if (!userId) throw new BadRequestError("No user found");
    if (isNaN(jobId)) {
      throw new BadRequestError("Invalid ScheduledAnalysisJob ID.");
    }

    if (cronExpression) {
      try {
        CronExpressionParser.parse(cronExpression);
      } catch (e) {
        throw new BadRequestError("Invalid cronExpression format.");
      }
    }

    const existingJob = await prisma.scheduledAnalysisJob.findUnique({
      where: { id: jobId, userId: userId },
    });

    if (!existingJob) {
      throw new NotFoundError(`ScheduledAnalysisJob with ID ${jobId} not found or does not belong to the user.`);
    }

    const updatedJob = await prisma.scheduledAnalysisJob.update({
      where: { id: jobId },
      data: {
        name: name ?? existingJob.name,
        cronExpression: cronExpression ?? existingJob.cronExpression,
        prompt: prompt ?? existingJob.prompt,
        enabled: typeof enabled === 'boolean' ? enabled : existingJob.enabled,
        updatedAt: new Date(),
      },
    });

    await updateScheduledJob(updatedJob.id);

    res.status(200).json(updatedJob);
  })
);

router.delete(
  '/:id',
  authMiddleware,
  requestHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    const jobId = parseInt(req.params.id, 10);

    if (!userId) throw new BadRequestError("No user found");
    if (isNaN(jobId)) {
      throw new BadRequestError("Invalid ScheduledAnalysisJob ID.");
    }

    const existingJob = await prisma.scheduledAnalysisJob.findUnique({
      where: { id: jobId, userId: userId },
    });

    if (!existingJob) {
      throw new NotFoundError(`ScheduledAnalysisJob with ID ${jobId} not found or does not belong to the user.`);
    }

    unscheduleJob(jobId);

    await prisma.scheduledAnalysisJob.delete({
      where: { id: jobId },
    });

    res.status(204).send();
  })
);

export default router;