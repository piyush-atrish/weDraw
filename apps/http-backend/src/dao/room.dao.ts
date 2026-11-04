import {prisma} from "@repo/db";
import { AppError } from "../utils/AppError.js";
import { isUniqueViolation } from "../utils/prismaErrors.js";

interface roomData{
    slug : string
    userId : string | undefined
}


export const createRoom = async (roomData: roomData) => {
    try {
        const room = await prisma.room.create({
            data: { adminId: Number(roomData.userId), slug: roomData.slug },
            select: { id: true },
        });
        return room.id;
    } catch (e) {
        if (isUniqueViolation(e)) throw new AppError("Slug already taken", 409);
        console.error(e);
        throw new AppError("error while registering room in database", 500);
    }
};

export const getRoomId = async (slug: string) => {
    try {
        const room = await prisma.room.findUnique({ where: { slug }, select: { id: true } });
        if (!room) throw new AppError("Room not found", 404);
        return room.id;
    } catch (e) {
        if (e instanceof AppError) throw e;
        console.error(e);
        throw new AppError("error while looking up room", 500);
    }
};

export const getChats = async (roomId: number) => {
    try {
        const rows = await prisma.chat.findMany({
            where: { roomId },
            orderBy: { id: "desc" },
            take: 50,
            select: {
                id: true,
                userId: true,
                message: true,
                user: { select: { userName: true } },
            },
        });

        // Flatten so the frontend gets { id, userId, userName, message }
        return rows.map(({ user, ...chat }) => ({
            ...chat,
            userName: user.userName ?? `User #${chat.userId}`,
        }));
    } catch (e) {
        console.error(e);
        throw new AppError("could not fetch chats for the given room", 500);
    }
};

export const getRoomById = async (roomId: number) => {
    try {
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { id: true, slug: true, adminId: true },
        });
        if (!room) throw new AppError("Room not found", 404);
        return room;
    } catch (e) {
        if (e instanceof AppError) throw e;
        console.error(e);
        throw new AppError("error while fetching room", 500);
    }
};