import { prisma } from "@/lib/database";
import { BadRequestError, Conflict } from "@/lib/errors";
import requestHandler from "@/lib/utils";
import { Router, Request, Response } from "express";

const router = Router();

router.post('/', requestHandler(async (req: Request, res: Response): Promise<void> => {
    const email = req.body?.email;

    if (!email) {
        throw new BadRequestError("Email is required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new Conflict("User already exists");
    }

    const newUser = await prisma.user.create({ data: { email, password: "TEMPORARY_PASSWORD" } });

    const { password: _, ...userData } = newUser;
    res.status(201).json({ user: userData });

}));

export default router;