"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Templates", href: "/templates" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || menuOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid ? "bg-white/95 shadow-[0_1px_0_rgba(45,62,80,0.08)] backdrop-blur-sm" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8">
        <Link
          href="/"
          className={cn(
            "font-heading text-lg font-bold tracking-tight transition-colors",
            solid ? "text-navy" : "text-white"
          )}
        >
          TripConsole
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-body text-sm font-medium transition-colors",
                solid ? "text-text-grey hover:text-navy" : "text-white/80 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className={cn(
              "font-body text-sm font-medium transition-colors",
              solid ? "text-navy hover:text-navy/70" : "text-white hover:text-white/80"
            )}
          >
            Log In
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: "accent", size: "sm" })}>
            Start Planning
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className={cn("flex h-9 w-9 items-center justify-center rounded-full md:hidden", solid ? "text-navy" : "text-white")}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-navy/10 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 font-body text-sm font-medium text-navy hover:bg-navy/5"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-navy/10 pt-3">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-body text-sm font-medium text-navy hover:bg-navy/5">
                Log In
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className={buttonVariants({ variant: "accent", size: "sm", className: "justify-center" })}>
                Start Planning
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
