import { prisma } from "@packages/database";
import { BadRequestError, Conflict } from "@/lib/errors";
import { requestHandler } from "@/lib/utils";
import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";

const router = Router();

interface CreateUserBody {
  email?: string;
  password?: string;
  firstname?: string;
  lastname?: string;
}

router.post('/', requestHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, firstname, lastname } = req.body as CreateUserBody;

    if (!email || !password) {
        throw new BadRequestError("Email and password are required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new Conflict("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({ 
        data: { 
            email, 
            firstName: firstname,
            lastName: lastname,
            password: hashedPassword,
        } 
    });

    const { password: _, ...userData } = newUser;
    res.status(201).json({ user: userData });
}));

export default router;