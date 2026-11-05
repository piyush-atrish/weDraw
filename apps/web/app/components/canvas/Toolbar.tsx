"use client";

import { ReactNode } from "react";
import type { Tool } from "../../lib/canvas/types";
import { IconButton } from "../ui/IconButton";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const TOOLS: { id: Tool; label: string; icon: ReactNode }[] = [
  { id: "rectangle", label: "Rectangle", icon: <rect x="4" y="6" width="16" height="12" rx="1" /> },
  { id: "circle", label: "Circle", icon: <circle cx="12" cy="12" r="8" /> },
  { id: "triangle", label: "Triangle", icon: <path d="M12 4 21 20H3Z" /> },
  { id: "arrow", label: "Arrow", icon: <path d="M5 19 19 5M9 5h10v10" /> },
  { id: "line", label: "Line", icon: <path d="M5 19 19 5" /> },
  { id: "pencil", label: "Pencil", icon: <path d="M4 20l1-4L16 5a2.12 2.12 0 013 3L8 19l-4 1z" /> },
  {
    id: "eraser",
    label: "Eraser",
    icon: (
      <>
        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
        <path d="M22 21H7" />
        <path d="m5 11 9 9" />
      </>
    ),
  },
];

interface ToolbarProps {
  tool: Tool;
  onChange: (tool: Tool) => void;
}

export function Toolbar({ tool, onChange }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Drawing tools"
      className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-md"
    >
      {TOOLS.map((t) => (
        <IconButton key={t.id} label={t.label} active={tool === t.id} onClick={() => onChange(t.id)}>
          <Icon>{t.icon}</Icon>
        </IconButton>
      ))}
    </div>
  );
}