import { trianglePoints } from "./geometry";
import type { Shape } from "./types";

export function drawShape(ctx: CanvasRenderingContext2D, shape: Shape, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  switch (shape.type) {
    case "rectangle":
      ctx.rect(shape.x, shape.y, shape.w, shape.h);
      break;

    case "triangle": {
      const [a, b, c] = trianglePoints(shape);
      ctx.moveTo(a!.x, a!.y);
      ctx.lineTo(b!.x, b!.y);
      ctx.lineTo(c!.x, c!.y);
      ctx.closePath();
      break;
    }

    case "circle":
      ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
      break;

    case "line":
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      break;

    case "arrow": {
      const { x1, y1, x2, y2 } = shape;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const head = Math.min(Math.max(12, shape.lineWidth * 6), Math.hypot(x2 - x1, y2 - y1));
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      for (const side of [-1, 1]) {
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - head * Math.cos(angle + (side * Math.PI) / 6),
          y2 - head * Math.sin(angle + (side * Math.PI) / 6),
        );
      }
      break;
    }

    case "pencil": {
      const pts = shape.points;
      ctx.moveTo(pts[0]!.x, pts[0]!.y);
      if (pts.length < 3) {
        // One point draws a dot (round cap), two points a straight segment
        pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        if (pts.length === 1) ctx.lineTo(pts[0]!.x, pts[0]!.y);
      } else {
        // Curve through the midpoints so freehand strokes look smooth instead of jagged
        for (let i = 1; i < pts.length - 1; i++) {
          const mid = { x: (pts[i]!.x + pts[i + 1]!.x) / 2, y: (pts[i]!.y + pts[i + 1]!.y) / 2 };
          ctx.quadraticCurveTo(pts[i]!.x, pts[i]!.y, mid.x, mid.y);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last!.x, last!.y);
      }
      break;
    }
  }

  ctx.stroke();
  ctx.restore();
}