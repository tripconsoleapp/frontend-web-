"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { RequireAuth } from "@/components/auth/require-auth";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="min-h-screen px-10 pb-10 pt-24 lg:ml-60 lg:pt-10 xl:px-14 xl:pb-12 xl:pt-12">
        <RequireAuth>{children}</RequireAuth>
      </div>
    </div>
  );
}
