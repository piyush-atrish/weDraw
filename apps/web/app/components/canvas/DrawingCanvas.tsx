"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasEngine } from "../../lib/canvas/CanvasEngine";
import type { Tool } from "../../lib/canvas/types";
import { DrawingSyncOptions, useDrawingSync } from "../../hooks/useDrawingSync";
import { Toolbar } from "./Toolbar";

export function DrawingCanvas({ roomId, joined, send, subscribe }: DrawingSyncOptions) {
  const [tool, setTool] = useState<Tool>("rectangle");
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const engine = new CanvasEngine(canvas);
    engineRef.current = engine;

    const observer = new ResizeObserver(([entry]) => {
      engine.resize(entry!.contentRect.width, entry!.contentRect.height);
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setTool(tool);
  }, [tool]);

  // Must stay below the engine effect above, since effects run in order
  useDrawingSync(engineRef, { roomId, joined, send, subscribe });

  return (
    <div className="absolute inset-0">
      <Toolbar tool={tool} onChange={setTool} />
      <div ref={containerRef} className="absolute inset-0 bg-gray-300">
        <canvas
          ref={canvasRef}
          className={`block h-full w-full touch-none select-none ${
            joined ? "cursor-crosshair" : "cursor-wait"
          }`}
        />
      </div>
    </div>
  );
}