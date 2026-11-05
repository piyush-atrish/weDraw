import { drawShape } from "./draw";
import { isNearShape } from "./geometry";
import type { Point, Shape, Tool } from "./types";

const BACKGROUND = "#d1d5db"; // Tailwind gray-300
const STROKE = { color: "#111827", lineWidth: 2 };
const ERASER_RADIUS = 8;
const MIN_SIZE = 3; // ignore accidental clicks that would create a 0-size shape
// A 60Hz display delivers a frame every 16.7ms; the -2 keeps us on every 2nd frame (30fps)
// instead of occasionally skipping to every 3rd because of float jitter
const FRAME_MS = 1000 / 30 - 2;

interface EngineOptions {
  onShapeAdded?: (shape: Shape) => void;
  onShapesRemoved?: (ids: string[]) => void;
}


export class CanvasEngine {
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[] = []; // permanent shapes, in draw order
  private tool: Tool = "rectangle";

  // Current gesture (between pointerdown and pointerup)
  private start: Point | null = null;
  private current: Point | null = null;
  private pencilPoints: Point[] = [];
  private erasing = new Set<string>(); // shapes the eraser has touched, removed on pointerup

  private width = 0;
  private height = 0;
  private raf = 0;
  private lastFrame = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private options: EngineOptions = {},
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas is not supported in this browser");
    this.ctx = ctx;

    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerCancel);
  }

  // ---- public API (also what the backend sync will use later) ----

  setTool(tool: Tool) {
    this.abortGesture();
    this.tool = tool;
  }

  resize(width: number, height: number) {
    const dpr = window.devicePixelRatio || 1;
    this.width = width;
    this.height = height;
    // Setting width/height clears the canvas and resets the transform
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels from here on
    this.render();
  }

  getShapes() {
    return this.shapes;
  }

  setShapes(shapes: Shape[]) {
    this.shapes = shapes;
    this.render();
  }

  addShape(shape: Shape) {
    if (this.shapes.some((s) => s.id === shape.id)) return; // idempotent
    this.shapes.push(shape);
    this.requestRender();
  }

  removeShapes(ids: string[]) {
    const remove = new Set(ids);
    this.shapes = this.shapes.filter((s) => !remove.has(s.id));
    ids.forEach((id) => this.erasing.delete(id));
    this.requestRender();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerCancel);
  }

  // ---- pointer events (handle mouse, touch and pen, and keep tracking outside the canvas) ----

  private onPointerDown = (e: PointerEvent) => {
    if (!this.enabled || e.button !== 0 || this.start) return;
    this.canvas.setPointerCapture(e.pointerId);

    const p = this.toPoint(e);
    this.start = p;
    this.current = p;
    if (this.tool === "pencil") this.pencilPoints = [p];
    if (this.tool === "eraser") this.eraseAt(p);
    this.requestRender();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.start || !this.current) return;
    const p = this.toPoint(e);

    // Pencil and eraser consume every event so fast strokes stay accurate;
    // only the redraw below is limited to 30fps
    if (this.tool === "pencil") this.pencilPoints.push(p);
    if (this.tool === "eraser") this.eraseAlong(this.current, p);

    this.current = p;
    this.requestRender();
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.start || !this.current) return;
    const p = this.toPoint(e);
    if (this.tool === "pencil") this.pencilPoints.push(p);
    if (this.tool === "eraser") this.eraseAlong(this.current, p);
    this.current = p;

    this.commit();
    this.resetGesture();
    this.render(); // final frame immediately, without waiting for the throttle
  };

  private onPointerCancel = () => this.abortGesture();

  // ---- gesture lifecycle ----

  private commit() {
    if (this.tool === "eraser") {
      const removed = this.shapes.filter((s) => this.erasing.has(s.id)).map((s) => s.id);
      if (removed.length === 0) return;
      this.shapes = this.shapes.filter((s) => !this.erasing.has(s.id));
      this.options.onShapesRemoved?.(removed);
      return;
    }

    const shape = this.buildShape(crypto.randomUUID());
    if (!shape) return;
    this.shapes.push(shape); // from now on it's redrawn on every clear, like any other shape
    this.options.onShapeAdded?.(shape);
  }

  private resetGesture() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.start = null;
    this.current = null;
    this.pencilPoints = [];
    this.erasing.clear();
  }

  private abortGesture() {
    if (!this.start) return;
    this.resetGesture();
    this.render();
  }

  // ---- building shapes from the gesture ----

  private buildShape(id: string): Shape | null {
    const { start, current } = this;
    if (!start || !current) return null;

    const base = { id, ...STROKE };
    const dx = current.x - start.x;
    const dy = current.y - start.y;
    const tool = this.tool;

    switch (tool) {
      case "rectangle":
      case "triangle": {
        const w = Math.abs(dx);
        const h = Math.abs(dy);
        if (w < MIN_SIZE && h < MIN_SIZE) return null;
        return {
          ...base,
          type: tool,
          x: Math.min(start.x, current.x),
          y: Math.min(start.y, current.y),
          w,
          h,
        };
      }
      case "circle": {
      const diameter = Math.hypot(dx, dy);
      if (diameter < MIN_SIZE) return null;
      return {
          ...base,
          type: "circle",
          cx: start.x + dx / 2,
          cy: start.y + dy / 2,
          r: diameter / 2,
      };
      }
      case "line":
      case "arrow": {
        if (Math.hypot(dx, dy) < MIN_SIZE) return null;
        return { ...base, type: tool, x1: start.x, y1: start.y, x2: current.x, y2: current.y };
      }
      case "pencil":
        return this.pencilPoints.length ? { ...base, type: "pencil", points: [...this.pencilPoints] } : null;
      case "eraser":
        return null;
    }
  }

  // ---- eraser ----

  private eraseAt(p: Point) {
    for (const shape of this.shapes) {
      if (!this.erasing.has(shape.id) && isNearShape(shape, p, ERASER_RADIUS)) {
        this.erasing.add(shape.id);
      }
    }
  }

  // Test points along the move so a fast sweep can't jump over a thin line
  private eraseAlong(from: Point, to: Point) {
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / ERASER_RADIUS));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.eraseAt({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
    }
  }

  // ---- rendering ----

  private requestRender() {
    if (this.raf) return;
    this.raf = requestAnimationFrame((now) => {
      this.raf = 0;
      if (now - this.lastFrame < FRAME_MS) {
        this.requestRender(); // too soon, try again next frame
        return;
      }
      this.lastFrame = now;
      this.render();
    });
  }

  private render = () => {
    const { ctx } = this;

    // clearCanvas: repaint the background
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, this.width, this.height);

    // redraw every permanent shape (dimmed if the eraser is about to remove it)
    for (const shape of this.shapes) {
      drawShape(ctx, shape, this.erasing.has(shape.id) ? 0.25 : 1);
    }

    // draw the shape being dragged, using the latest coordinates
    if (this.start && this.tool !== "eraser") {
      const draft = this.buildShape("draft");
      if (draft) drawShape(ctx, draft);
    }

    if (this.start && this.current && this.tool === "eraser") {
      ctx.save();
      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(this.current.x, this.current.y, ERASER_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  };

  private toPoint(e: PointerEvent): Point {
      const rect = this.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    private enabled = false; // drawing is only allowed once we've joined the room

  setCallbacks(options: EngineOptions) {
    this.options = options;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.abortGesture();
  }

}