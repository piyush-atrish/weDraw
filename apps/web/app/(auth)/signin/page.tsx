"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthForm } from "../../components/AuthForm";
import { GoogleAuthSection } from "../../components/GoogleAuthSection";
import { OtpForm } from "../../components/OtpForm";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { useAuth } from "../../hooks/useAuth";

type Mode = "password" | "code";

const modes = [
  { value: "password", label: "Password" },
  { value: "code", label: "Email code" },
] as const;

const emailField = {
  name: "email",
  label: "Email",
  type: "email",
  placeholder: "you@example.com",
  autoComplete: "email",
} as const;

const passwordFields = [
  emailField,
  { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
] as const;

const codeFields = [emailField] as const;

export default function SignInPage() {
  const { login, requestOtp, verifyOtp } = useAuth();
  const [mode, setMode] = useState<Mode>("password");
  // Set once a code has been emailed. `password` is kept only to allow "resend" on the password path
  const [pending, setPending] = useState<{ email: string; password?: string } | null>(null);

  if (pending) {
    return (
      <OtpForm
        email={pending.email}
        onVerify={(code) => verifyOtp(pending.email, code)}
        onResend={async () => {
          if (pending.password) await login(pending.email, pending.password);
          else await requestOtp(pending.email);
        }}
        onBack={() => setPending(null)}
      />
    );
  }

  return (
    <AuthForm
      key={mode} // resets the fields when switching methods
      title="Welcome back"
      subtitle="Sign in to create and join rooms."
      beforeForm={
        <div className="flex flex-col gap-5">
          <GoogleAuthSection />
          <SegmentedControl label="Sign-in method" options={modes} value={mode} onChange={setMode} />
        </div>
      }
      fields={mode === "password" ? passwordFields : codeFields}
      submitLabel={mode === "password" ? "Sign in" : "Send code"}
      onSubmit={async ({ email, password }) => {
        if (mode === "password") {
          const result = await login(email, password);
          if (result.verificationRequired) setPending({ email: result.email, password });
        } else {
          await requestOtp(email);
          setPending({ email: email.trim().toLowerCase() });
        }
      }}
      footer={
        <>
          No account?{" "}
          <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
            Sign up
          </Link>
        </>
      }
    />
  );
}