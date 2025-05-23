import { Router } from "express";
import usersRouter from "./users";
import authRouter from "./auth";
import crawlerRouter from "./crawler-jobs";
import scheduledAnalysisRouter from "./scheduled-analysis";
import analyserRouter from "./analyser-jobs";
const router = Router();

router.use('/auth',  authRouter)
router.use('/users', usersRouter)
router.use('/crawler-jobs', crawlerRouter)
router.use('/analyser-jobs', analyserRouter)
router.use('/scheduled-analysis', scheduledAnalysisRouter)
export default router;
