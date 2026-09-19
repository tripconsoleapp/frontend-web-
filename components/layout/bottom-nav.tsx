"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, User, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/trips", label: "My Trips", icon: ClipboardList },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-navy/10 bg-white">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 font-body text-xs font-medium",
                active ? "text-orange" : "text-text-grey"
              )}
            >
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
