"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthForm } from "../../components/AuthForm";
import { GoogleAuthSection } from "../../components/GoogleAuthSection";
import { OtpForm } from "../../components/OtpForm";
import { useAuth } from "../../hooks/useAuth";

const fields = [
  {
    name: "userName",
    label: "Username",
    placeholder: "yourname",
    autoComplete: "username",
    hint: "3–30 characters: letters, numbers, dots and underscores. Not case-sensitive.",
  },
  { name: "email", label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    hint: "8–20 characters with an uppercase letter, a lowercase letter, a number and a special character. It can't contain your username or the first part of your email.",
  },
] as const;

export default function SignUpPage() {
  const { signup, login, verifyOtp } = useAuth();
  const [pending, setPending] = useState<{ email: string; password: string } | null>(null);

  if (pending) {
    return (
      <OtpForm
        email={pending.email}
        onVerify={(code) => verifyOtp(pending.email, code)}
        // Signing in with the same details re-sends the signup code
        onResend={async () => {
          await login(pending.email, pending.password);
        }}
        onBack={() => setPending(null)}
      />
    );
  }

  return (
    <AuthForm
      title="Create your account"
      subtitle="Start drawing with others in real time."
      beforeForm={<GoogleAuthSection />}
      fields={fields}
      submitLabel="Sign up"
      onSubmit={async (values) => {
        const result = await signup(values);
        if (result.verificationRequired) setPending({ email: result.email, password: values.password });
      }}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    />
  );
}