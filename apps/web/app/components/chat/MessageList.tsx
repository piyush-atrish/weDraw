"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../hooks/useRoomChat";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: number;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (messages.length === 0) {
    return <p className="m-auto text-sm text-gray-500">No messages yet. Say hello!</p>;
  }

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {messages.map((m) => {
          const mine = m.userId === currentUserId;
          return (
            <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
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
      <div ref={bottomRef} />
    </div>
  );
}