"use client";

import { useAuth } from "../hooks/useAuth";
import { GoogleButton } from "./GoogleButton";

export function GoogleAuthSection() {
  const { loginWithGoogle } = useAuth();
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  return (
    <div className="flex flex-col gap-5">
      <GoogleButton onCredential={loginWithGoogle} />
      <div className="flex items-center gap-3 text-xs uppercase text-gray-500" aria-hidden="true">
        <span className="h-px flex-1 bg-gray-200" />
        or
        <span className="h-px flex-1 bg-gray-200" />
      </div>
    </div>
  );
}