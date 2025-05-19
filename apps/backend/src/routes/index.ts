import { Router } from "express";
import usersRouter from "./users";
import authRouter from "./auth";
import crawlerRouter from "./crawler-jobs";

const router = Router();

router.use('/auth',  authRouter)
router.use('/users', usersRouter)
router.use('/crawler-jobs', crawlerRouter)

export default router;
