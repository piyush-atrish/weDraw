import { prisma } from "@repo/db";
import type { RoomManager } from "./RoomManager.js";

const minutes = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export async function deleteIdleRooms(rooms: RoomManager, idleMs: number) {
  const cutoff = new Date(Date.now() - idleMs);

  const idle = await prisma.room.findMany({
    where: {
      createdAt: { lte: cutoff },
      chats: { none: { createdAt: { gt: cutoff } } },
      drawings: { none: { createdAt: { gt: cutoff } } },
      id: { notIn: rooms.activeRoomIds() },
    },
    select: { id: true },
  });


  const ids = idle.map((r) => r.id).filter((id) => !rooms.hasMembers(id));
  if (ids.length === 0) return 0;

  await prisma.room.deleteMany({ where: { id: { in: ids } } });

  for (const id of ids) rooms.closeRoom(id, { type: "room_deleted", roomId: id });

  return ids.length;
}

export function startRoomCleanup(rooms: RoomManager) {

  const idleMs = minutes("ROOM_IDLE_MINUTES", 60) * 60_000;
  const intervalMs = minutes("CLEANUP_INTERVAL_MINUTES", 60) * 60_000;

  let running = false;
  const timer = setInterval(async () => {
    if (running) return; 
    running = true;
    try {
      const count = await deleteIdleRooms(rooms, idleMs);
      if (count > 0) console.log(`[cleanup] deleted ${count} idle room(s)`);
    } catch (err) {
      console.error("[cleanup] failed", err);
    } finally {
      running = false;
    }
  }, intervalMs);

  return () => clearInterval(timer);
}