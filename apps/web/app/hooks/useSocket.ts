"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import type { ClientMessage, ServerMessage } from "../lib/socketTypes";

const WS_URL = process.env.WS_URL ?? "ws://localhost:8080";
const MAX_BACKOFF_MS = 15_000;

export type SocketStatus = "connecting" | "open" | "reconnecting" | "closed" | "unauthorized";
type Listener = (message: ServerMessage) => void;

export function useSocket() {
  const { isLoggedIn } = useAuth();
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const socketRef = useRef<WebSocket | null>(null);
  const listeners = useRef(new Set<Listener>());

useEffect(() => {
  if (!isLoggedIn) return;

  let current: WebSocket | undefined;
  let retries = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  const connect = () => {
    setStatus(retries === 0 ? "connecting" : "reconnecting");
    const socket = new WebSocket(WS_URL);
    current = socket;
    socketRef.current = socket;

    socket.onopen = () => {
      retries = 0;
      setStatus("open");
    };

    socket.onmessage = (event) => {
      let data: ServerMessage;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      listeners.current.forEach((listener) => listener(data));
    };

    socket.onclose = (event) => {
      // Only clear the ref if it still points at THIS socket. In dev, the old socket's
      // close event fires after the new one was created and would otherwise wipe it out.
      if (socketRef.current === socket) socketRef.current = null;
      if (disposed) return;
      // The server closes with 1008 when the cookie is missing, expired or the origin is wrong
      if (event.code === 1008) {
        setStatus("unauthorized");
        return;
      }
      setStatus("reconnecting");
      timer = setTimeout(connect, Math.min(1000 * 2 ** retries++, MAX_BACKOFF_MS));
    };
  };

  connect();

  return () => {
    disposed = true;
    clearTimeout(timer);
    const socket = current;
    if (socket) {
      socket.onmessage = null;
      if (socket.readyState === WebSocket.CONNECTING) {
        // Closing mid-handshake logs a browser warning, so close once it opens
        socket.onopen = () => socket.close();
      } else {
        socket.close();
      }
    }
    socketRef.current = null;
  };
}, [isLoggedIn]);

  // Returns false if the message could not be sent (socket not open)
  const send = useCallback((message: ClientMessage) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(message));
    return true;
  }, []);

  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  return { status: isLoggedIn ? status : "closed", send, subscribe };
}