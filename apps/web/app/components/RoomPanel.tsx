"use client";

import { useRouter } from "next/navigation";
import { RoomActionForm } from "./RoomActionForm";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";

export function RoomPanel() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  // Returns false (after redirecting) when the visitor isn't logged in
  const ensureLoggedIn = () => {
    if (isLoading) throw new Error("Checking your session, try again in a moment.");
    if (!isLoggedIn) {
      router.push("/signin");
      return false;
    }
    return true;
  };

const createRoom = async (slug: string) => {
  if (!ensureLoggedIn()) return;
  const { data } = await api.post<{ roomId: number }>("/user/room/create", { slug });
  router.push(`/room/${data.roomId}`);
};

const joinRoom = async (slug: string) => {
  if (!ensureLoggedIn()) return;
  const { data } = await api.get<{ roomId: number }>(`/user/room/getId/${encodeURIComponent(slug)}`);
  router.push(`/room/${data.roomId}`);
};

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <RoomActionForm
        label="Room slug"
        placeholder="Enter a slug for your new room"
        buttonLabel="Create room"
        onSubmit={createRoom}
      />
      <RoomActionForm
        label="Room slug to join"
        placeholder="Enter a room slug to join"
        buttonLabel="Join room"
        variant="secondary"
        onSubmit={joinRoom}
      />
    </div>
  );
}