import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-60 min-h-screen px-10 py-10 xl:px-14 xl:py-12">
        {children}
      </div>
    </div>
  );
}
