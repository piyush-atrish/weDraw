import { z } from "zod";

export const passwordSchema = z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password cannot exceed 20 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[\W_]/, { message: "Must contain at least one special character (e.g., !@#$)" });

export const emailSchema = z.string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: "Invalid email format" }));

export const userNameSchema = z.string()
    .trim()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username cannot exceed 30 characters" })
    .regex(/^[A-Za-z0-9_.]+$/, { message: "Username can only use letters, numbers, dots and underscores" });

const contains = (password: string, term: string) =>
    term.length >= 3 && password.toLowerCase().includes(term.toLowerCase());

export const signUpSchema = z.object({
    email: emailSchema,
    userName: userNameSchema,
    password: passwordSchema,
}).refine(
    (d) => !contains(d.password, d.userName) && !contains(d.password, d.email.split("@")[0]!),
    { message: "Password cannot contain your username or the first part of your email", path: ["password"] },
);

export const signInSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, { message: "Password is required" }),
});

export const otpRequestSchema = z.object({ email: emailSchema });

export const otpVerifySchema = z.object({
    email: emailSchema,
    code: z.string().regex(/^\d{6}$/, { message: "Enter the 6-digit code" }),
});

export const googleSchema = z.object({ credential: z.string().min(1) });