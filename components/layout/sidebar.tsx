"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FolderOpen,
  Home,
  Landmark,
  User,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/trips", label: "My Trips", icon: ClipboardList },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/documents", label: "Documents Center", icon: FolderOpen },
  { href: "/pilgrimage", label: "Pilgrimage Programs", icon: Landmark },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-navy py-6">
      <Link
        href="/dashboard"
        className="px-6 pb-8 font-heading text-base font-bold text-white"
      >
        TripConsole
      </Link>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 font-body text-base font-medium transition-colors",
                active
                  ? "bg-orange text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
