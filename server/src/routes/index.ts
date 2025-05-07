import { Router } from "express";
import usersRouter from "./users";
import authRouter from "./auth";
import crawlerRouter from "./crawler";

const router = Router();
router.use('/auth',  authRouter)
router.use('/users', usersRouter)
router.use('/crawler', crawlerRouter)

export default router;
