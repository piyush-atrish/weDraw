import { InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  showLabel?: boolean;
  hint?: string;
}

export function Input({ label, showLabel = false, hint, className = "", id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;

  return (
    <div className="flex-1">
      <label
        htmlFor={inputId}
        className={showLabel ? "mb-1.5 block text-sm font-medium text-gray-700" : "sr-only"}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-describedby={hint ? hintId : undefined}
        className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${className}`}
        {...props}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}