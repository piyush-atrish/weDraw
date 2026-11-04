"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { RoomChat } from "../../hooks/useRoomChat";
import type { RoomInfo } from "../../hooks/useRoomInfo";
import { Button, ButtonLink } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ConnectionStatus } from "./ConnectionStatus";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

interface ChatPanelProps {
  roomId: number;
  room: RoomInfo | null;
  chat: RoomChat;
}

export function ChatPanel({ roomId, room, chat }: ChatPanelProps) {
  const { user } = useAuth();
  const { messages, status, joined, isLoadingHistory, error, sendMessage, deleteRoom } = chat;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isAdmin = room !== null && user?.id === room.adminId;

  const loadingLabel =
    status !== "open" ? "Connecting to the server…" : !joined ? "Joining room…" : "Loading messages…";

  return (
    <>
      <header className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="truncate text-base font-semibold text-gray-900">
            {room?.slug ?? `Room #${roomId}`}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <ButtonLink href="/" variant="ghost">
              Leave
            </ButtonLink>
            {isAdmin && (
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Delete
              </Button>
            )}
          </div>
        </div>
        <div className="mt-1">
          <ConnectionStatus status={status} />
        </div>
      </header>

      {error && (
        <p role="alert" className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="m-4 mb-0 flex min-h-0 flex-1 flex-col rounded-xl border border-gray-200 bg-gray-50 p-3">
        {isLoadingHistory && !error ? (
          <p className="m-auto text-sm text-gray-500">{loadingLabel}</p>
        ) : (
          <MessageList messages={messages} currentUserId={user?.id} />
        )}
      </div>

      <div className="p-4">
        <MessageInput onSend={sendMessage} disabled={status !== "open" || !joined} />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this room?"
        description="The room and all of its messages will be permanently deleted for everyone. This can't be undone."
        confirmLabel="Delete room"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          deleteRoom();
        }}
      />
    </>
  );
}