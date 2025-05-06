import { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "./errors";

export default function requestHandler(
  handler: (req: Request, res: Response, next?: NextFunction) => Promise<void> | void,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next))
      .catch((error) => {
        if (error instanceof AppError) {
          if (!res.headersSent) {
            res.status(error.statusCode).json({
              message: error.message,
            });
          }
          return;
        }

        if (!res.headersSent) {
          res.status(500).json({
            message: "Internal server error",
            ...(process.env.NODE_ENV !== "production" && error instanceof Error
              ? { error: error.message }
              : {}),
          });
        }
        console.error("Unhandled error in requestHandler:", error);
      });
  };
}
