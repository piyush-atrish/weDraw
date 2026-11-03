"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

// Renders children only for logged-out visitors (signin/signup pages)
export function GuestOnly({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isLoggedIn) router.replace("/");
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || isLoggedIn) return null;
  return <>{children}</>;
}

// Renders children only for logged-in users, otherwise sends them to /signin
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace("/signin");
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn) return null;
  return <>{children}</>;
}