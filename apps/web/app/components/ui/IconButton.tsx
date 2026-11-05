import { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string; // used for the tooltip and screen readers
  active?: boolean;
  children: ReactNode;
}

export function IconButton({ label, active = false, className = "", children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        active ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}