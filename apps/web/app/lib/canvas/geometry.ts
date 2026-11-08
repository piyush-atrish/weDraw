import type { BoxShape, Point, Shape } from "./types";

export const rectPoints = ({ x, y, w, h }: BoxShape): Point[] => [
  { x, y },
  { x: x + w, y },
  { x: x + w, y: y + h },
  { x, y: y + h },
];

export const trianglePoints = ({ x, y, w, h }: BoxShape): Point[] => [
  { x: x + w / 2, y }, // apex
  { x: x + w, y: y + h },
  { x, y: y + h },
];

export function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  // Project p onto the segment, clamped to its ends
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function nearPath(p: Point, pts: Point[], tol: number, closed: boolean): boolean {
  const n = pts.length;
  if (n === 1) return Math.hypot(p.x - pts[0]!.x, p.y - pts[0]!.y) <= tol;
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    if (distToSegment(p, pts[i]!, pts[(i + 1) % n]!) <= tol) return true;
  }
  return false;
}

// Shapes are outlines only, so "hit" means the pointer is near the stroke, not inside the shape
export function isNearShape(shape: Shape, p: Point, radius: number): boolean {
  const tol = radius + shape.lineWidth / 2;
  switch (shape.type) {
    case "rectangle":
      return nearPath(p, rectPoints(shape), tol, true);
    case "triangle":
      return nearPath(p, trianglePoints(shape), tol, true);
    case "circle":
      return Math.abs(Math.hypot(p.x - shape.cx, p.y - shape.cy) - shape.r) <= tol;
    case "line":
    case "arrow":
      return (
        distToSegment(p, { x: shape.x1, y: shape.y1 }, { x: shape.x2, y: shape.y2 }) <= tol
      );
    case "pencil":
      return nearPath(p, shape.points, tol, false);
  }
}