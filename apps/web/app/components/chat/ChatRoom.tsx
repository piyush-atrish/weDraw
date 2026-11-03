"use client";

import { useAuth } from "../../hooks/useAuth";
import { useRoomChat } from "../../hooks/useRoomChat";
import { ConnectionStatus } from "./ConnectionStatus";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

export function ChatRoom({ roomId }: { roomId: number }) {
  const { user } = useAuth();
  const { messages, status, joined, isLoadingHistory, error, sendMessage } = useRoomChat(roomId);

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Room #{roomId}</h1>
        <ConnectionStatus status={status} />
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4">
        {isLoadingHistory && !error ? (
          <p className="m-auto text-sm text-gray-500">Loading messages…</p>
        ) : (
          <MessageList messages={messages} currentUserId={user?.id} />
        )}
      </div>

      <div className="mt-3">
        <MessageInput onSend={sendMessage} disabled={status !== "open" || !joined} />
      </div>
    </main>
  );
}