import { randomInt } from "node:crypto";
import { prisma } from "@repo/db";
import bcrypt from "bcrypt";
import { AppError } from "../utils/AppError.js";
import { isUniqueViolation } from "../utils/prismaErrors.js";
import type { OtpPurpose } from "../services/otp.service.js";

const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

interface SignUpData {
    email: string;
    userName: string;
    password: string;
}

export const registerUnverifiedUser = async ({ email, userName, password }: SignUpData) => {
    const userNameKey = userName.toLowerCase();
    try {
        const [existing, nameOwner] = await Promise.all([
            prisma.user.findUnique({ where: { email } }),
            prisma.user.findUnique({ where: { userNameKey } }),
        ]);
        if (existing?.emailVerified) throw new AppError("Email already registered", 409);
        if (nameOwner && nameOwner.id !== existing?.id) throw new AppError("Username already taken", 409);

        const passwordHash = await bcrypt.hash(password, 10);
        if (existing) {
            await prisma.user.update({
                where: { id: existing.id },
                data: { userName, userNameKey, password: passwordHash },
            });
        } else {
            await prisma.user.create({ data: { email, userName, userNameKey, password: passwordHash } });
        }
    } catch (e) {
        if (e instanceof AppError) throw e;
        if (isUniqueViolation(e)) throw new AppError("That email or username was just taken, please try again", 409);
        console.error(e);
        throw new AppError("error while registering user in database", 500);
    }
};

export const userSignIn = async ({ email, password }: { email: string; password: string }) => {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        const ok = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
        if (!user || !user.password || !ok) throw new AppError("Invalid email or password", 401);
        return { id: user.id, email: user.email, emailVerified: user.emailVerified };
    } catch (e) {
        if (e instanceof AppError) throw e;
        console.error("Database error during sign-in:", e);
        throw new AppError("Error while signing in", 500);
    }
};

export const findUserByEmail = async (
    email: string,
): Promise<{ id: number; emailVerified: boolean } | null> =>
    prisma.user.findUnique({
        where: { email },
        select: { id: true, emailVerified: true },
    });

export const getUserById = async (id: number) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, userName: true },
        });
        if (!user) throw new AppError("User not found", 401);
        return user;
    } catch (e) {
        if (e instanceof AppError) throw e;
        console.error(e);
        throw new AppError("Error while fetching user", 500);
    }
};

export const verifyEmail = async (user: { id: number; emailVerified: boolean }, purpose: OtpPurpose) => {
    if (user.emailVerified) return;
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            ...(purpose === "login" ? { password: null } : {}),
        },
    });
};

const sanitize = (s: string) => s.replace(/[^A-Za-z0-9_.]/g, "").slice(0, 24);

async function pickUserName(preferred: string) {
    let base = sanitize(preferred);
    if (base.length < 3) base = `user${base}`;

    for (let i = 0; i < 6; i++) {
        const candidate = i === 0 ? base : `${base}${randomInt(100, 10_000)}`;
        const taken = await prisma.user.findUnique({ where: { userNameKey: candidate.toLowerCase() } });
        if (!taken) return candidate;
    }
    throw new AppError("Couldn't pick a username, please try again", 500);
}

export const findOrCreateGoogleUser = async (
    { googleId, email, name }: { googleId: string; email: string; name: string | null },
) => {
    try {
        const byGoogle = await prisma.user.findUnique({ where: { googleId } });
        if (byGoogle) return byGoogle;

        const byEmail = await prisma.user.findUnique({ where: { email } });
        if (byEmail) {
            return await prisma.user.update({
                where: { id: byEmail.id },
                data: { googleId, emailVerified: true, ...(byEmail.emailVerified ? {} : { password: null }) },
            });
        }

        const userName = await pickUserName(name ?? email.split("@")[0]!);
        return await prisma.user.create({
            data: { email, googleId, emailVerified: true, userName, userNameKey: userName.toLowerCase() },
        });
    } catch (e) {
        if (e instanceof AppError) throw e;
        if (isUniqueViolation(e)) throw new AppError("Please try signing in again", 409);
        console.error(e);
        throw new AppError("Error while signing in with Google", 500);
    }
};