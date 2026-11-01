import { z } from "zod";

export const passwordSchema = z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password cannot exceed 20 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[\W_]/, { message: "Must contain at least one special character (e.g., !@#$)" });

export const credSchema = z.object({
    email: z.email({ message: "Invalid email format" }),
    password: passwordSchema,
    userName: z.string().max(50),
}).refine((data) => !data.password.includes(data.userName), {
    message: "Password cannot contain your user name",
    path: ["password"]
});
