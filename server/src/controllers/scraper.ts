import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const initScraper = async (req: Request, res: Response) => {
  const jobId = uuidv4();

  res.json({
    jobId: jobId
  });

};

