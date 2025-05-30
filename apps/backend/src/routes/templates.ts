import { Request, Response } from "express";
import { Router } from "express";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { requestHandler } from "@/lib/utils";
import { authMiddleware } from "@/middlewares/auth";
import { prisma } from "@packages/database";

const router = Router();

// Get all templates for the authenticated user
router.get(
  '/',
  authMiddleware,
  requestHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    if (!userId) throw new BadRequestError("No user found");

    const templates = await prisma.template.findMany({
      where: {
        analyserJob: {
          userId: userId,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(templates);
  })
);

// Create a new template
router.post(
  '/',
  authMiddleware,
  requestHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    const { name, content, type, dynamic, analyserJobId } = req.body;

    if (!name || !content) {
      throw new BadRequestError("Name and content are required");
    }

    // Optionally validate that the analyserJob belongs to the user
    let analyserJobConnect = undefined;
    if (analyserJobId) {
      const analyserJob = await prisma.analyserJob.findUnique({
        where: { id: analyserJobId },
      });
      if (!analyserJob || analyserJob.userId !== userId) {
        throw new BadRequestError("Invalid analyserJobId");
      }
      analyserJobConnect = { connect: { id: analyserJobId } };
    }

    const template = await prisma.template.create({
      data: {
        name,
        content,
        type,
        dynamic,
        ...(analyserJobConnect && { analyserJob: analyserJobConnect }),
      },
    });

    res.status(201).json(template);
  })
);

// Get a specific template by ID (only if it belongs to the user)
router.get(
  '/:id',
  authMiddleware,
  requestHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    const templateId = Number(req.params.id);

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { analyserJob: true },
    });

    if (!template || (template.analyserJob && template.analyserJob.userId !== userId)) {
      throw new NotFoundError("Template not found");
    }

    res.status(200).json(template);
  })
);

export default router;
