import { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "./errors";

export default function requestHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch((error) => {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
        });
      }

      res.status(500).json({
        message: "Internal server error",
        ...(process.env.NODE_ENV !== "production"
          ? { error: error.message }
          : {}),
      });
      throw error;
    });
  };
}
