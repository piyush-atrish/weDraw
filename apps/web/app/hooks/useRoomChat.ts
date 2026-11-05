"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSocket } from "./useSocket";

export interface ChatMessage {
  id: number;
  userId: number;
  userName: string;
  message: string;
}

export function useRoomChat(roomId: number) {
  const { status, send, subscribe } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [joined, setJoined] = useState(false);
  const [roomDeleted, setRoomDeleted] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addMessages = useCallback((incoming: ChatMessage[]) => {
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      for (const m of incoming) byId.set(m.id, m);
      return [...byId.values()].sort((a, b) => a.id - b.id);
    });
  }, []);


  useEffect(
    () =>
      subscribe((msg) => {
        switch (msg.type) {
          case "joined":
            if (msg.roomId === roomId) {
              setError(null);
              setJoined(true);
            }
            break;
          case "chat":
            if (msg.roomId === roomId) {
              addMessages([
                { id: msg.id, userId: msg.from, userName: msg.fromName, message: msg.message },
              ]);
            }
            break;
          case "room_deleted":
            if (msg.roomId === roomId) {
              setMessages([]);
              setRoomDeleted(true);
            }
            break;
          case "error":
            setError(msg.error);
            break;
        }
      }),
    [subscribe, roomId, addMessages],
  );


  useEffect(() => {
    if (status !== "open") return;
    send({ type: "join_room", roomId });
    return () => {
      send({ type: "leave_room", roomId });
      setJoined(false);
    };
  }, [status, roomId, send]);


  useEffect(() => {
    if (status !== "open" || joined) return;
    const timer = setTimeout(
      () => setError("The server didn't respond to the join request. Is the ws-backend running?"),
      8000,
    );
    return () => clearTimeout(timer);
  }, [status, joined]);


  useEffect(() => {
    if (!joined) return;
    let cancelled = false;

    api
      .get<{ messages: ChatMessage[] }>(`/user/room/chats/${roomId}`)
      .then(({ data }) => {
        if (!cancelled) addMessages(data.messages);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [joined, roomId, addMessages]);

  const sendMessage = useCallback(
    (message: string) => send({ type: "chat", roomId, message }),
    [send, roomId],
  );

  const deleteRoom = useCallback(() => send({ type: "delete_room", roomId }), [send, roomId]);

  return {
  messages, status, joined, roomDeleted, isLoadingHistory, error,
  sendMessage, deleteRoom,
  send, subscribe,
};
}

export type RoomChat = ReturnType<typeof useRoomChat>;