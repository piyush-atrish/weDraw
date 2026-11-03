import { WebSocket } from "ws";

interface Client {
  userId: number;
  rooms: Set<number>;
}

export class RoomManager {
  private clients = new Map<WebSocket, Client>();
  private rooms = new Map<number, Set<WebSocket>>();

  addClient(ws: WebSocket, userId: number) {
    this.clients.set(ws, { userId, rooms: new Set() });
  }

  removeClient(ws: WebSocket) {
    const client = this.clients.get(ws);
    if (!client) return;
    for (const roomId of [...client.rooms]) this.leave(ws, roomId);
    this.clients.delete(ws);
  }

  getUserId(ws: WebSocket) {
    return this.clients.get(ws)?.userId;
  }

  join(ws: WebSocket, roomId: number) {
    const client = this.clients.get(ws);
    if (!client) return;
    client.rooms.add(roomId);
    if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set());
    this.rooms.get(roomId)!.add(ws);
  }

  leave(ws: WebSocket, roomId: number) {
    this.clients.get(ws)?.rooms.delete(roomId);
    const members = this.rooms.get(roomId);
    if (!members) return;
    members.delete(ws);
    if (members.size === 0) this.rooms.delete(roomId);
  }

  isInRoom(ws: WebSocket, roomId: number) {
    return this.clients.get(ws)?.rooms.has(roomId) ?? false;
  }

  broadcast(roomId: number, payload: unknown) {
    const data = JSON.stringify(payload);
    for (const client of this.rooms.get(roomId) ?? []) {
      if (client.readyState === WebSocket.OPEN) client.send(data);
    }
  }
}