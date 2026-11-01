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
        
        const jwtKey: string | undefined = process.env.JWT_USER;
        if (!jwtKey) throw new Error("missing jwt key");
        
        const userId = verifyToken(token, jwtKey);
        req.userId = userId;
        
        next();
    } catch (e) {
        next(e);
    }
}