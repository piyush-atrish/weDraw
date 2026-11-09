import "dotenv/config";
import { Router } from "express";
import type { CookieOptions, Response } from "express";
import type { ZodType } from "zod";
import { createToken } from "@repo/backend-packages/jwt.utils";
import {
    googleSchema, otpRequestSchema, otpVerifySchema, signInSchema, signUpSchema,
} from "../validators/auth.validator.js";
import {
    findOrCreateGoogleUser, findUserByEmail, getUserById,
    registerUnverifiedUser, userSignIn, verifyEmail,
} from "../dao/user.dao.js";
import { consumeOtp, issueOtp } from "../services/otp.service.js";
import { verifyGoogleCredential } from "../services/google.service.js";
import { userAuth } from "../middlewares/userAuth.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { AppError } from "../utils/AppError.js";

export const userRouter: Router = Router();

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
};

const parse = <T>(schema: ZodType<T>, body: unknown): T => {
    const result = schema.safeParse(body);
    if (!result.success) throw new AppError(result.error.issues[0]?.message ?? "Invalid request", 400);
    return result.data;
};

const issueSession = (res: Response, userId: number) => {
    const jwtKey = process.env.JWT_USER;
    if (!jwtKey) throw new Error("missing jwt key");
    res.cookie("token", createToken(String(userId), jwtKey), { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
};

userRouter.post("/signup", authLimiter, async (req, res) => {
    const data = parse(signUpSchema, req.body);
    await registerUnverifiedUser(data);
    await issueOtp(data.email, "signup");
    res.status(202).json({ status: "verification_required", email: data.email });
});

userRouter.post("/signin", authLimiter, async (req, res) => {
    const data = parse(signInSchema, req.body);
    const user = await userSignIn(data);

    if (!user.emailVerified) {
        await issueOtp(user.email, "signup");
        res.status(200).json({ status: "verification_required", email: user.email });
        return;
    }

    issueSession(res, user.id);
    res.status(200).json({ status: "ok" });
});

userRouter.post("/otp/request", authLimiter, async (req, res) => {
    const { email } = parse(otpRequestSchema, req.body);
    const user = await findUserByEmail(email);
    if (user) void issueOtp(email, "login").catch((e) => console.error("[otp] failed", e));
    res.status(200).json({ message: "If an account exists for that email, a code is on its way." });
});

userRouter.post("/otp/verify", authLimiter, async (req, res) => {
    const { email, code } = parse(otpVerifySchema, req.body);
    const purpose = await consumeOtp(email, code);

    const user = await findUserByEmail(email);
    if (!user) throw new AppError("Invalid or expired code", 400);

    await verifyEmail(user, purpose);
    issueSession(res, user.id);
    res.status(200).json({ status: "ok" });
});

userRouter.post("/google", authLimiter, async (req, res) => {
    const { credential } = parse(googleSchema, req.body);
    const profile = await verifyGoogleCredential(credential);
    const user = await findOrCreateGoogleUser(profile);
    issueSession(res, user.id);
    res.status(200).json({ status: "ok" });
});

userRouter.post("/logout", (_req, res) => {
    res.clearCookie("token", cookieOptions);
    res.status(200).json({ message: "logged out" });
});

userRouter.get("/me", userAuth, async (req, res) => {
    const user = await getUserById(Number(req.userId));
    res.status(200).json({ user });
});