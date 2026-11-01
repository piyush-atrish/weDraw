import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export const globalErrorHandler = (
    err: Error | AppError, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Something went wrong on the server";

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        if (err.message === "User not found with this phone number" || err.message === "Invalid password") {
        message = "Incorrect phone number or password";
    }
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};