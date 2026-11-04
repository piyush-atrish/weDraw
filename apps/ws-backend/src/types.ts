import { z } from "zod";

export const MessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("join_room"), roomId: z.number().int().positive() }),
  z.object({ type: z.literal("leave_room"), roomId: z.number().int().positive() }),
  z.object({
    type: z.literal("chat"),
    roomId: z.number().int().positive(),
    message: z.string().min(1).max(2000),
  }),
  z.object({ type: z.literal("delete_room"), roomId: z.number().int().positive() }),
]);

export type ClientMessage = z.infer<typeof MessageSchema>;