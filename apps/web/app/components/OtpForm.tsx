"use client";

import { FormEvent, useState } from "react";
import { useCountdown } from "../hooks/useCountdown";
import { Button } from "./ui/Button";
import { Heading } from "./ui/Heading";
import { Input } from "./ui/Input";

interface OtpFormProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export function OtpForm({ email, onVerify, onResend, onBack }: OtpFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { secondsLeft, restart } = useCountdown(60);

  const message = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending || code.length !== 6) return;
    setError(null);
    setNotice(null);
    setIsPending(true);
    try {
      await onVerify(code); // on success the auth state changes and the page redirects
    } catch (err) {
      setError(message(err));
    } finally {
      setIsPending(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setNotice(null);
    try {
      await onResend();
      restart();
      setNotice("A new code is on its way.");
    } catch (err) {
      setError(message(err));
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <Heading title="Check your email" subtitle={`We sent a 6-digit code to ${email}`} size="md" />

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <Input
          showLabel
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}

        <Button type="submit" disabled={isPending || code.length !== 6} className="w-full">
          {isPending ? "Checking…" : "Verify"}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <Button variant="ghost" onClick={handleResend} disabled={secondsLeft > 0}>
          {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Use a different email
        </Button>
      </div>
    </div>
  );
}