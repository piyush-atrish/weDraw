export type Tool = "rectangle" | "circle" | "triangle" | "arrow" | "line" | "pencil" | "eraser";

export interface Point {
  x: number;
  y: number;
}

interface Base {
  id: string;
  color: string;
  lineWidth: number;
}

// Rectangle and triangle share a normalized box (w, h >= 0), so the triangle always points up
export interface BoxShape extends Base {
  type: "rectangle" | "triangle";
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CircleShape extends Base {
  type: "circle";
  cx: number;
  cy: number;
  r: number;
}

export interface LineShape extends Base {
  type: "line" | "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PencilShape extends Base {
  type: "pencil";
  points: Point[];
}

export type Shape = BoxShape | CircleShape | LineShape | PencilShape;