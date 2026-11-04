"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

export interface RoomInfo {
  id: number;
  slug: string;
  adminId: number;
}

export function useRoomInfo(roomId: number) {
  const [room, setRoom] = useState<RoomInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ room: RoomInfo }>(`/user/room/info/${roomId}`)
      .then(({ data }) => {
        if (!cancelled) setRoom(data.room);
      })
      .catch(() => {
        // A missing room is already reported by the socket's join error
      });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  return room;
}