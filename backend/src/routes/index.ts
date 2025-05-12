import { Router } from "express";
import usersRouter from "./users";
import authRouter from "./auth";
import crawlerRouter from "./crawler";
import jobsRouter from "./jobs";

const router = Router();

router.use('/auth',  authRouter)
router.use('/users', usersRouter)
router.use('/crawler', crawlerRouter)
router.use('/jobs', jobsRouter)

export default router;
