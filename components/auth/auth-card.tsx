import Link from "next/link";
import { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 py-12">
      <Link href="/" className="font-heading text-xl font-semibold text-navy">
        TripConsole
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
        {children}
      </div>
    </main>
  );
}
