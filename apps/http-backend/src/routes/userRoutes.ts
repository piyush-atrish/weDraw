import "dotenv/config";
import { Router } from "express";
import type { CookieOptions, Request, Response, NextFunction } from "express";
import { credSchema, signInSchema } from "../validators/auth.validator.js";
import { createToken } from "@repo/backend-packages/jwt.utils";
import { createUser, userSignIn, getUserById } from "../dao/user.dao.js";
import { userAuth } from "../middlewares/userAuth.js";
import { AppError } from "../utils/AppError.js";

export const userRouter: Router = Router();


const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
};

userRouter.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = credSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(parsed.error.issues[0]?.message ?? "Provide proper credentials", 400);
        }
        await createUser(parsed.data);
        res.status(201).json({ message: "user signed up!" });
    } catch (e) {
        next(e);
    }
});

userRouter.post("/signin", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = signInSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new AppError(parsed.error.issues[0]?.message ?? "Provide proper credentials", 400);
        }
        const id = await userSignIn(parsed.data);

        const jwtKey = process.env.JWT_USER;
        if (!jwtKey) throw new Error("missing jwt key");

        res.cookie("token", createToken(id, jwtKey), { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
        res.status(200).json({ message: "you have signed in" });
    } catch (e) {
        next(e);
    }
});

userRouter.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("token", cookieOptions);
    res.status(200).json({ message: "logged out" });
});


userRouter.get("/me", userAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await getUserById(Number(req.userId));
        res.status(200).json({ user });
    } catch (e) {
        next(e);
    }
});