"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  FolderOpen,
  Home,
  Landmark,
  Menu,
  User,
  Wallet,
  X,
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

function NavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 font-body text-base font-medium transition-all duration-200",
              active
                ? "bg-orange text-white shadow-sm shadow-orange/30"
                : "text-white/70 hover:translate-x-0.5 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** The sidebar is a fixed 240px column on large screens (unchanged), but
 *  below `lg` it collapses into a slim top bar with an off-canvas drawer
 *  instead of permanently eating a third of a phone-width viewport. */
export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between bg-navy px-4 lg:hidden">
        <Link href="/dashboard" className="font-heading text-base font-bold text-white">
          TripConsole
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
        >
          <Menu size={20} />
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-navy py-6 lg:flex">
        <Link href="/dashboard" className="px-6 pb-8 font-heading text-base font-bold text-white">
          TripConsole
        </Link>
        <NavLinks pathname={pathname} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="absolute inset-0 bg-navy/60 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-navy py-6 shadow-2xl">
            <div className="flex items-center justify-between px-6 pb-8">
              <span className="font-heading text-base font-bold text-white">TripConsole</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
