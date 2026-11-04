"use client";

import { useEffect, useRef } from "react";

const BACKGROUND = "#d1d5db"; // Tailwind gray-300

export function DrawingCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = container.getBoundingClientRect();

      // Match the buffer to the screen's pixel density so it stays sharp on retina displays.
      // Setting width/height clears the canvas and resets the transform.
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // from here on, draw in CSS pixels

      ctx.fillStyle = BACKGROUND;
      ctx.fillRect(0, 0, width, height);
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-gray-300">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}