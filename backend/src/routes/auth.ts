import { prisma } from "@/lib/database";
import { BadRequestError, AuthenticationError } from "@/lib/errors";
import { requestHandler } from "@/lib/utils";
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/utils/jwt";

const router = Router();

router.post('/', requestHandler(async (req: Request, res: Response): Promise<void> => {
    const email = req.body?.email;
    const password = req.body?.password;

    if (!email || !password) {
        throw new BadRequestError("Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new AuthenticationError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AuthenticationError("wrong email or password");
    }

    const token = signToken({ userId: user.id });

    res.status(200).json({ token });
}));

export default router;