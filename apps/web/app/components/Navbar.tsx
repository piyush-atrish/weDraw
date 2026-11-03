"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "./ui/Button";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          weDraw
        </Link>

        <div className="flex min-w-[10rem] items-center justify-end gap-3">
          {isLoading ? null : isLoggedIn ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-gray-600 sm:block">
                {user?.userName ?? user?.email}
              </span>
              <Button variant="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/signin" variant="ghost">
                Sign in
              </ButtonLink>
              <ButtonLink href="/signup">Sign up</ButtonLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}