import { z } from "zod";

export const slugSchema = z.string()
    .trim()
    .toLowerCase()
    .min(3, { message: "Slug must be at least 3 characters" })
    .max(50, { message: "Slug cannot exceed 50 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Use only letters, numbers and hyphens" });