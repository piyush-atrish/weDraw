"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Button } from "./ui/Button";
import { Heading } from "./ui/Heading";
import { Input } from "./ui/Input";

export interface AuthField<N extends string> {
  name: N;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}

interface AuthFormProps<N extends string> {
  title: string;
  subtitle?: string;
  beforeForm?: ReactNode; // content shown above the fields, like the Google button
  fields: readonly AuthField<N>[];
  submitLabel: string;
  onSubmit: (values: Record<N, string>) => Promise<void>;
  footer?: ReactNode;
}

export function AuthForm<N extends string>({
  title,
  subtitle,
  beforeForm,
  fields,
  submitLabel,
  onSubmit,
  footer,
}: AuthFormProps<N>) {
  const [values, setValues] = useState(
    () => Object.fromEntries(fields.map((f) => [f.name, ""])) as Record<N, string>,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    setError(null);
    setIsPending(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <Heading title={title} subtitle={subtitle} size="md" />

      {beforeForm && <div className="mt-6">{beforeForm}</div>}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        {fields.map((f) => (
          <Input
            key={f.name}
            showLabel
            name={f.name}
            label={f.label}
            type={f.type ?? "text"}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            hint={f.hint}
            required
            value={values[f.name]}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
          />
        ))}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Please wait…" : submitLabel}
        </Button>
      </form>

      {footer && <p className="mt-6 text-center text-sm text-gray-600">{footer}</p>}
    </div>
  );
}