import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { userAuth } from "../middlewares/userAuth.js";
import { createRoom, getChats, getRoomId , getRoomById } from "../dao/room.dao.js";
import { slugSchema } from "../validators/room.validator.js";
import { AppError } from "../utils/AppError.js";

export const roomRouter: Router = Router();

roomRouter.use(userAuth);

const parseSlug = (value: unknown) => {
    const parsed = slugSchema.safeParse(value);
    if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Invalid slug", 400);
    return parsed.data;
};

const parseRoomId = (value: unknown) => {
    const roomId = Number(value);
    if (!Number.isInteger(roomId) || roomId <= 0) throw new AppError("Invalid room id", 400);
    return roomId;
};


roomRouter.post("/create", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slug = parseSlug(req.body?.slug);
        const roomId = await createRoom({ userId: req.userId, slug });
        res.status(201).json({ roomId });
    } catch (e) {
        next(e);
    }
});

roomRouter.get("/getId/:slug", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roomId = await getRoomId(parseSlug(req.params.slug));
        res.status(200).json({ roomId });
    } catch (e) {
        next(e);
    }
});

roomRouter.get("/chats/:roomId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roomId = Number(req.params.roomId);
        if (!Number.isInteger(roomId) || roomId <= 0) throw new AppError("Invalid room id", 400);
        const messages = await getChats(roomId);
        res.status(200).json({ messages });
    } catch (e) {
        next(e);
    }
});

roomRouter.get("/info/:roomId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const room = await getRoomById(parseRoomId(req.params.roomId));
        res.status(200).json({ room });
    } catch (e) {
        next(e);
    }
});