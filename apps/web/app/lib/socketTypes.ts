export type ClientMessage =
  | { type: "join_room"; roomId: number }
  | { type: "leave_room"; roomId: number }
  | { type: "delete_room"; roomId: number }
  | { type: "chat"; roomId: number; message: string };

export type ServerMessage =
  | { type: "joined"; roomId: number }
  | { type: "left"; roomId: number }
  | { type: "room_deleted"; roomId: number }
  | { type: "chat"; id: number; roomId: number; from: number; fromName: string; message: string }
  | { type: "error"; error: string };