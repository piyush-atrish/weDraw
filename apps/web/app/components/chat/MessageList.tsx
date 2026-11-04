"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../hooks/useRoomChat";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: number;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll only this container. scrollIntoView would also scroll ancestors, and with the
  // sidebar hidden off-screen it could shift the whole page when a message arrives.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {messages.length === 0 ? (
        <p className="m-auto text-sm text-gray-500">No messages yet. Say hello!</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {messages.map((m) => {
            const mine = m.userId === currentUserId;
            return (
              <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-indigo-600 text-white" : "border border-gray-200 bg-white text-gray-900"
                  }`}
                >
                  {!mine && <p className="mb-0.5 text-xs font-medium text-gray-500">{m.userName}</p>}
                  <p className="whitespace-pre-wrap break-words">{m.message}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}