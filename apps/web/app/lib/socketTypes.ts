import type { Shape } from "./canvas/types";

export type ClientMessage =
  | { type: "join_room"; roomId: number }
  | { type: "leave_room"; roomId: number }
  | { type: "delete_room"; roomId: number }
  | { type: "chat"; roomId: number; message: string }
  | { type: "draw"; roomId: number; shape: Shape }
  | { type: "erase"; roomId: number; shapeIds: string[] };

export type ServerMessage =
  | { type: "joined"; roomId: number }
  | { type: "left"; roomId: number }
  | { type: "room_deleted"; roomId: number }
  | { type: "chat"; id: number; roomId: number; from: number; fromName: string; message: string }
  | { type: "drawings"; roomId: number; shapes: Shape[] }
  | { type: "draw"; roomId: number; shape: Shape }
  | { type: "erase"; roomId: number; shapeIds: string[] }
  | { type: "error"; error: string };