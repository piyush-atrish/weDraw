import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@repo/db";
import { AppError } from "../utils/AppError.js";
import { sendOtpEmail } from "./mailer.js";

export type OtpPurpose = "signup" | "login";

const OTP_TTL_MS = 10 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_ATTEMPTS = 5;

const hash = (email: string, code: string) =>
    createHmac("sha256", process.env.JWT_USER!).update(`otp:${email}:${code}`).digest("hex");

const safeEqual = (a: string, b: string) => {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
};

const latestFor = (email: string) =>
    prisma.emailOtp.findFirst({ where: { email }, orderBy: { createdAt: "desc" } });

export async function issueOtp(email: string, purpose: OtpPurpose): Promise<boolean> {
    const existing = await latestFor(email);
    if (existing && existing.purpose === purpose && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
        return false;
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    await prisma.$transaction([
        prisma.emailOtp.deleteMany({ where: { email } }),
        prisma.emailOtp.create({
            data: { email, purpose, codeHash: hash(email, code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
        }),
    ]);

    try {
        await sendOtpEmail(email, code);
    } catch (e) {
        console.error("[otp] could not send email", e);
        await prisma.emailOtp.deleteMany({ where: { email } });
        throw new AppError("We couldn't send the email. Please try again.", 502);
    }
    return true;
}

export async function consumeOtp(email: string, code: string): Promise<OtpPurpose> {
    const invalid = new AppError("Invalid or expired code", 400);
    const row = await latestFor(email);
    if (!row || row.expiresAt.getTime() < Date.now()) throw invalid;

    if (row.attempts >= MAX_ATTEMPTS) {
        await prisma.emailOtp.deleteMany({ where: { id: row.id } });
        throw invalid;
    }

    if (!safeEqual(row.codeHash, hash(email, code))) {
        await prisma.emailOtp.updateMany({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
        throw invalid;
    }

    const { count } = await prisma.emailOtp.deleteMany({ where: { id: row.id } });
    if (count !== 1) throw invalid;

    return row.purpose as OtpPurpose;
}