import { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "@/lib/errors";

const requestHandler = (
  handler: (req: Request, res: Response, next?: NextFunction) => Promise<void> | void,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next))
      .catch((error: any) => {
        if (error && (error._isAppError === true || error instanceof AppError)) {
          if (!res.headersSent) {
            res.status(error.statusCode || 500).json({
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
        console.error("Unhandled error (not an AppError) in requestHandler:", error);
      });
  };
}

export { requestHandler}
