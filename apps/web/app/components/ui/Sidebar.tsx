"use client";

import { ReactNode, useId, useState } from "react";

interface SidebarProps {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Sidebar({ label, defaultOpen = true, children }: SidebarProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-20 w-80 max-w-[85vw] border-l border-gray-200 bg-white transition-all duration-300 ease-in-out ${
        open ? "translate-x-0 shadow-xl" : "translate-x-full shadow-none"
      }`}
    >
      {/* Attached to the panel's left edge, so it slides with the panel and stays visible when hidden */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="absolute right-full top-4 rounded-l-lg border border-r-0 border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {label}
      </button>

      {/* inert keeps hidden content out of the tab order and away from screen readers.
          The content stays mounted, so the socket and messages survive a hide/show. */}
      <div id={panelId} inert={!open} className="flex h-full flex-col">
        {children}
      </div>
    </aside>
  );
}