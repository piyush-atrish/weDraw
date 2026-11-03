"use client";

import Link from "next/link";
import { AuthForm } from "../../components/AuthForm";
import { useAuth } from "../../hooks/useAuth";

const fields = [
  { name: "userName", label: "User name", placeholder: "yourname", autoComplete: "username" },
  { name: "email", label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    hint: "8–20 characters with an uppercase letter, a lowercase letter, a number and a special character.",
  },
] as const;

export default function SignUpPage() {
  const { signup } = useAuth();

  return (
    <AuthForm
      title="Create your account"
      subtitle="Start drawing with others in real time."
      fields={fields}
      submitLabel="Sign up"
      onSubmit={(values) => signup(values)}
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