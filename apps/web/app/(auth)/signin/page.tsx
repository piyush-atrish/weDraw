"use client";

import Link from "next/link";
import { AuthForm } from "../../components/AuthForm";
import { useAuth } from "../../hooks/useAuth";

const fields = [
  { name: "email", label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
] as const;

export default function SignInPage() {
  const { login } = useAuth();

  // No redirect here: once login sets the user, <GuestOnly> sends them to "/"
  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to create and join rooms."
      fields={fields}
      submitLabel="Sign in"
      onSubmit={({ email, password }) => login(email, password)}
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