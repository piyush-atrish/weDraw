import { WebSocketServer, WebSocket } from "ws";
import { authenticate } from "./auth.js";
import { RoomManager } from "./RoomManager.js";
import { handleMessage } from "./handlers.js";
import { prisma } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });
const rooms = new RoomManager();
const alive = new WeakMap<WebSocket, boolean>();

wss.on("connection", (ws, request) => {
  const userId = authenticate(request);
  if (userId === null) {
    ws.close(1008, "Unauthorized");
    return;
  }

  const userName = prisma.user
  .findUnique({ where: { id: userId }, select: { userName: true } })
  .then((u) => u?.userName ?? `User #${userId}`)
  .catch(() => `User #${userId}`);

  rooms.addClient(ws, userId, userName);
  
  alive.set(ws, true);

  ws.on("pong", () => alive.set(ws, true));
  ws.on("message", (data) => {
    handleMessage(ws, data.toString(), rooms).catch((err) => {
      console.error(err);
      ws.send(JSON.stringify({ type: "error", error: "Internal error" }));
    });
  });
  ws.on("close", () => rooms.removeClient(ws));
  ws.on("error", console.error);
});


const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (!alive.get(ws)) {
      ws.terminate();
      continue;
    }
    alive.set(ws, false);
    ws.ping();
  }
}, 30_000);

wss.on("close", () => clearInterval(heartbeat));

console.log("web socket server running at port 8080...");