export type ClientMessage =
  | { type: "join_room"; roomId: number }
  | { type: "leave_room"; roomId: number }
  | { type: "chat"; roomId: number; message: string };

export type ServerMessage =
  | { type: "joined"; roomId: number }
  | { type: "left"; roomId: number }
  | { type: "chat"; id: number; roomId: number; from: number; message: string }
  | { type: "error"; error: string };