import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "@repo/backend-packages/jwt.utils";
import { AppError } from "../utils/AppError.js";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const userAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new AppError("Token Not Provided", 401);

        const jwtKey = process.env.JWT_USER;
        if (!jwtKey) throw new Error("missing jwt key");

        try {
            req.userId = verifyToken(token, jwtKey);
        } catch {
            throw new AppError("Invalid or expired token", 401);
        }

        next();
    } catch (e) {
        next(e);
    }
}