"use client";

import { FormEvent, useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface MessageInputProps {
  onSend: (text: string) => boolean; // return false if it couldn't be sent, so the text is kept
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    if (onSend(trimmed)) setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <Input
        label="Message"
        placeholder="Type a message"
        value={text}
        maxLength={2000}
        autoComplete="off"
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
      />
      <Button type="submit" disabled={disabled || !text.trim()} className="shrink-0">
        Send
      </Button>
    </form>
  );
}