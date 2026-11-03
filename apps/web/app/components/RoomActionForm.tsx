"use client";

import { FormEvent, useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface RoomActionFormProps {
  label: string;
  placeholder: string;
  buttonLabel: string;
  variant?: "primary" | "secondary";
  onSubmit?: (value: string) => void | Promise<void>;
}

export function RoomActionForm({
  label,
  placeholder,
  buttonLabel,
  variant = "primary",
  onSubmit,
}: RoomActionFormProps) {
  const [value, setValue] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isPending) return;

    setError(null);
    setIsPending(true);
    try {
      await onSubmit?.(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-3">
        <Input
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
        />
        <Button type="submit" variant={variant} disabled={!value.trim() || isPending} className="shrink-0">
          {isPending ? "Please wait…" : buttonLabel}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}