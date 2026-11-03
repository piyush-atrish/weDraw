"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSocket } from "./useSocket";

export interface ChatMessage {
  id: number;
  userId: number;
  message: string;
}

export function useRoomChat(roomId: number) {
  const { status, send, subscribe } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [joined, setJoined] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Merge by id so history and live messages can never duplicate each other
  const addMessages = useCallback((incoming: ChatMessage[]) => {
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      for (const m of incoming) byId.set(m.id, m);
      return [...byId.values()].sort((a, b) => a.id - b.id);
    });
  }, []);

  // Live events
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
              addMessages([{ id: msg.id, userId: msg.from, message: msg.message }]);
            }
            break;
          case "error":
            setError(msg.error);
            break;
        }
      }),
    [subscribe, roomId, addMessages],
  );

  // Server-side room membership is per connection, so (re)join every time the socket opens
  useEffect(() => {
    if (status !== "open") return;
    send({ type: "join_room", roomId });
    return () => {
      send({ type: "leave_room", roomId });
      setJoined(false);
    };
  }, [status, roomId, send]);

  // History: fetched after joining so no live message is missed; refetched after a reconnect to fill any gap
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

  return { messages, status, joined, isLoadingHistory, error, sendMessage };
}