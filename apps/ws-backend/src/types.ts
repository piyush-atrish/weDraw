import { z } from "zod";

const coord = z.number().min(-100_000).max(100_000);
const size = z.number().min(0).max(200_000);
const point = z.object({ x: coord, y: coord });

const base = {
  id: z.uuid(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  lineWidth: z.number().min(1).max(50),
};

const box = <T extends "rectangle" | "triangle">(type: T) =>
  z.object({ ...base, type: z.literal(type), x: coord, y: coord, w: size, h: size });

const segment = <T extends "line" | "arrow">(type: T) =>
  z.object({ ...base, type: z.literal(type), x1: coord, y1: coord, x2: coord, y2: coord });

export const ShapeSchema = z.discriminatedUnion("type", [
  box("rectangle"),
  box("triangle"),
  segment("line"),
  segment("arrow"),
  z.object({ ...base, type: z.literal("circle"), cx: coord, cy: coord, r: size }),
  z.object({ ...base, type: z.literal("pencil"), points: z.array(point).min(1).max(5000) }),
]);

export const MessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("join_room"), roomId: z.number().int().positive() }),
  z.object({ type: z.literal("leave_room"), roomId: z.number().int().positive() }),
  z.object({
    type: z.literal("chat"),
    roomId: z.number().int().positive(),
    message: z.string().min(1).max(2000),
  }),
  z.object({ type: z.literal("delete_room"), roomId: z.number().int().positive() }),
  z.object({ type: z.literal("draw"), roomId: z.number().int().positive(), shape: ShapeSchema }),
  z.object({
    type: z.literal("erase"),
    roomId: z.number().int().positive(),
    shapeIds: z.array(z.uuid()).min(1).max(500),
  }),
]);

export type ClientMessage = z.infer<typeof MessageSchema>;