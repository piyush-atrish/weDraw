"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRoomChat } from "../../hooks/useRoomChat";
import { useRoomInfo } from "../../hooks/useRoomInfo";
import { Button, ButtonLink } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ConnectionStatus } from "./ConnectionStatus";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

export function ChatRoom({ roomId }: { roomId: number }) {
  const { user } = useAuth();
  const room = useRoomInfo(roomId);
  const { messages, status, joined, roomDeleted, isLoadingHistory, error, sendMessage, deleteRoom } =
    useRoomChat(roomId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isAdmin = room !== null && user?.id === room.adminId;

  const loadingLabel =
    status !== "open" ? "Connecting to the server…" : !joined ? "Joining room…" : "Loading messages…";

  if (roomDeleted) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-xl font-semibold text-gray-900">This room was deleted</h1>
        <p className="text-sm text-gray-600">The room and all of its messages have been removed.</p>
        <ButtonLink href="/">Back to home</ButtonLink>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="truncate text-lg font-semibold text-gray-900">{room?.slug ?? `Room #${roomId}`}</h1>
        <div className="flex shrink-0 items-center gap-3">
          <ConnectionStatus status={status} />
          {isAdmin && (
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Delete room
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4">
        {isLoadingHistory && !error ? (
          <p className="m-auto text-sm text-gray-500">{loadingLabel}</p>
        ) : (
          <MessageList messages={messages} currentUserId={user?.id} />
        )}
      </div>

      <div className="mt-3">
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
    </main>
  );
}