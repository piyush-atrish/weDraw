import { WebSocket } from "ws";
import { prisma } from "@repo/db";
import { MessageSchema } from "./types.js";
import { RoomManager } from "./RoomManager.js";

const reply = (ws: WebSocket, payload: unknown) => ws.send(JSON.stringify(payload));

export const handleMessage = async (ws: WebSocket, raw: string, rooms: RoomManager) => {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return reply(ws, { type: "error", error: "Invalid JSON" });
  }

  const parsed = MessageSchema.safeParse(json);
  if (!parsed.success) return reply(ws, { type: "error", error: "Invalid message" });

  const msg = parsed.data;
  const userId = rooms.getUserId(ws);
  if (userId === undefined) return;

  if(msg.type == "join_room"){

    const room = await prisma.room.findUnique({
        where: { id: msg.roomId },
        select: { id: true },
      });
      if (!room) return reply(ws, { type: "error", error: "Room not found" });

      rooms.join(ws, room.id);
      return reply(ws, { type: "joined", roomId: room.id });

  }

  else if(msg.type == "leave_room"){

    rooms.leave(ws, msg.roomId);
    return reply(ws, { type: "left", roomId: msg.roomId });

  }

  else if(msg.type == "chat"){

      if (!rooms.isInRoom(ws, msg.roomId)) {
        return reply(ws, { type: "error", error: "Join the room first" });
      }
      
      await prisma.chat.create({
        data: { roomId: msg.roomId, userId, message: msg.message },
      });
      const chat = await prisma.chat.create({
        data: { roomId: msg.roomId, userId, message: msg.message },
      });
      rooms.broadcast(msg.roomId, {
        type: "chat",
        id: chat.id,
        roomId: msg.roomId,
        from: userId,
        message: msg.message,
      });
      return;

  }

}
