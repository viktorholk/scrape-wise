import { Router } from "express";
import usersRouter from "./users";
import authRouter from "./auth";
import crawlerRouter from "./crawler-jobs";
import templatesRouter from "./templates";

const router = Router();

router.use('/auth',  authRouter)
router.use('/users', usersRouter)
router.use('/crawler-jobs', crawlerRouter)
router.use('/templates', templatesRouter)

export default router;
