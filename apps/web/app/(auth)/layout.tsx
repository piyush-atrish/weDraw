import { ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { GuestOnly } from "../components/AuthGate";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-16">
        <GuestOnly>{children}</GuestOnly>
      </main>
    </div>
  );
}