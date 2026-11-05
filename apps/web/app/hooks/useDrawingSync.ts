"use client";

import { RefObject, useEffect } from "react";
import type { CanvasEngine } from "../lib/canvas/CanvasEngine";
import type { ClientMessage, ServerMessage } from "../lib/socketTypes";

export interface DrawingSyncOptions {
  roomId: number;
  joined: boolean;
  send: (message: ClientMessage) => boolean;
  subscribe: (listener: (message: ServerMessage) => void) => () => void;
}

export function useDrawingSync(
  engineRef: RefObject<CanvasEngine | null>,
  { roomId, joined, send, subscribe }: DrawingSyncOptions,
) {

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    return subscribe((msg) => {
      switch (msg.type) {
        case "drawings":
          if (msg.roomId === roomId) engine.setShapes(msg.shapes); 
          break;
        case "draw":
          if (msg.roomId === roomId) engine.addShape(msg.shape);
          break;
        case "erase":
          if (msg.roomId === roomId) engine.removeShapes(msg.shapeIds);
          break;
      }
    });
  }, [engineRef, roomId, subscribe]);


  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.setCallbacks({
      onShapeAdded: (shape) => send({ type: "draw", roomId, shape }),
      onShapesRemoved: (shapeIds) => send({ type: "erase", roomId, shapeIds }),
    });
    return () => engine.setCallbacks({});
  }, [engineRef, roomId, send]);


  useEffect(() => {
    engineRef.current?.setEnabled(joined);
  }, [engineRef, joined]);
}