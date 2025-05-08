import { prisma } from "@/lib/database";
import { requestHandler } from "@/lib/utils";
import { Router, Request, Response } from "express";
import { authMiddleware } from "@/middlewares/auth";

const router = Router();

router.get('/', authMiddleware, requestHandler(async (req: Request, res: Response): Promise<void> => {

    const userId = req.userId!;

    const jobs = await prisma.crawlerJob.findMany({
        where: {
            userId
        },
        select: {
            id: true,
            initialUrl: true,
            crawlDepth: true,
            pageLimit: true,
            createdAt: true,
            status: true,
            results: true,
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    res.status(200).json(jobs);
}));

export default router;