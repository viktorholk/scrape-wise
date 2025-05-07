import { Request, Response, NextFunction } from "express";
import { Token, verifyToken } from "@/lib/utils/jwt";
import { AuthenticationError } from "@/lib/errors";
import { requestHandler } from "@/lib/utils";


export const authMiddleware = requestHandler(
  async (req: Request, res: Response, next?: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AuthenticationError("No token provided");
    }

    const decoded = verifyToken(token) as Token;

    if (!decoded) {
      throw new AuthenticationError("Invalid token");
    }

    req.userId = Number(decoded.userId);
    next && next();
  },
);
