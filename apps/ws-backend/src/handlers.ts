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

  if (msg.type === "join_room") {
    const room = await prisma.room.findUnique({
      where: { id: msg.roomId },
      select: {
        id: true,
        drawings: { orderBy: { id: "asc" }, select: { data: true } },
      },
    });
      if (!room) return reply(ws, { type: "error", error: "Room not found" });
      rooms.join(ws, room.id);
      reply(ws, { type: "joined", roomId: room.id });
      return reply(ws, {
        type: "drawings",
        roomId: room.id,
        shapes: room.drawings.map((d) => JSON.parse(d.data)),
    });
  }

  else if(msg.type == "leave_room"){

    rooms.leave(ws, msg.roomId);
    return reply(ws, { type: "left", roomId: msg.roomId });

  }

  else if (msg.type == "chat") {
    if (!rooms.isInRoom(ws, msg.roomId)) {
      return reply(ws, { type: "error", error: "Join the room first" });
    }

    
    const chat = await prisma.chat.create({
      data: { roomId: msg.roomId, userId, message: msg.message },
    });

    rooms.broadcast(msg.roomId, {
      type: "chat",
      id: chat.id,
      roomId: msg.roomId,
      from: userId,
      fromName: await rooms.getUserName(ws),
      message: msg.message,
    });
    return;
  }

  else if (msg.type === "delete_room") {
      const room = await prisma.room.findUnique({
        where: { id: msg.roomId },
        select: { adminId: true },
      });
      if (!room) return reply(ws, { type: "error", error: "Room not found" });
      if (room.adminId !== userId) {
        return reply(ws, { type: "error", error: "Only the room admin can delete this room" });
      }

      await prisma.$transaction([
        prisma.chat.deleteMany({ where: { roomId: msg.roomId } }),
        prisma.room.delete({ where: { id: msg.roomId } }),
      ]);

      rooms.closeRoom(msg.roomId, { type: "room_deleted", roomId: msg.roomId });
      return;
}

if (msg.type === "draw") {
  if (!rooms.isInRoom(ws, msg.roomId)) {
    return reply(ws, { type: "error", error: "Join the room first" });
  }

  const { count } = await prisma.drawing.createMany({
    data: [{ roomId: msg.roomId, shapeId: msg.shape.id, data: JSON.stringify(msg.shape) }],
    skipDuplicates: true, // a retried draw with the same id is ignored
  });
  if (count === 0) return;

  rooms.broadcast(msg.roomId, { type: "draw", roomId: msg.roomId, shape: msg.shape }, ws);
  return;
}

if (msg.type === "erase") {
  if (!rooms.isInRoom(ws, msg.roomId)) {
    return reply(ws, { type: "error", error: "Join the room first" });
  }

  // Scoped by roomId so a client can never delete shapes belonging to another room
  await prisma.drawing.deleteMany({
    where: { roomId: msg.roomId, shapeId: { in: msg.shapeIds } },
  });

  rooms.broadcast(msg.roomId, { type: "erase", roomId: msg.roomId, shapeIds: msg.shapeIds }, ws);
  return;
}

}
