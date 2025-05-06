import { initScraper } from "@/controllers/scraper";
import requestHandler from "@/lib/utils";
import { Router } from "express";

const router = Router();

router.use('/scraper', requestHandler(initScraper))

export default router;
