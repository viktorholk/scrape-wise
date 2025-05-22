import { Request, Response } from "express";
import { Router } from "express";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { requestHandler } from "@/lib/utils";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@packages/database";

const router = Router();

router.get(
  '/',
  authMiddleware,
  requestHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) throw new BadRequestError("No user found");

    const scheduledAnalysis = await prisma.scheduledAnalysis.findMany({
      where: { userId },
      orderBy: { index: "desc" },
    });

    res.status(200).json(scheduledAnalysis);
  })
);

router.post(
  '/',
  authMiddleware,
  requestHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    
    if (!userId) throw new BadRequestError("No user found");

    const { name, cronExpression, analyserJobId, crawlerJobId } = req.body;

    if (!name || !cronExpression || !analyserJobId || !crawlerJobId) {
      throw new BadRequestError("Missing required fields");
    }

    // get the prompt from the analyser job
    const analyserJob = await prisma.analyserJob.findUnique({
      where: { id: analyserJobId },
    });

    if (!analyserJob) throw new NotFoundError("Analyser job not found");

    const prompt = analyserJob.prompt;

    const count = await prisma.scheduledAnalysis.count({
      where: { userId },
    });

    const scheduledAnalysis = await prisma.scheduledAnalysis.create({
      data: {
        userId,
        index: count,
        name,
        cronExpression,
        enabled: true,
        prompt,
        crawlerJobId,
        analyserJobId,
      },
    });

    res.status(201).json(scheduledAnalysis);
  })
);

export default router;