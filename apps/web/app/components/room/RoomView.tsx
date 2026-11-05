"use client";

import { useRoomChat } from "../../hooks/useRoomChat";
import { useRoomInfo } from "../../hooks/useRoomInfo";
import { DrawingCanvas } from "../canvas/DrawingCanvas";
import { ChatPanel } from "../chat/ChatPanel";
import { Sidebar } from "../ui/Sidebar";
import { RoomDeleted } from "./RoomDeleted";

export function RoomView({ roomId }: { roomId: number }) {
  const room = useRoomInfo(roomId);
  const chat = useRoomChat(roomId);

  if (chat.roomDeleted) return <RoomDeleted />;

  return (
    <div className="fixed inset-0 overflow-hidden">
      <DrawingCanvas
        roomId={roomId}
        joined={chat.joined}
        send={chat.send}
        subscribe={chat.subscribe}
      />
      <Sidebar label="Chat">
        <ChatPanel roomId={roomId} room={room} chat={chat} />
      </Sidebar>
    </div>
  );
}