import { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";

export function AppShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white pb-20">
      {header}
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
