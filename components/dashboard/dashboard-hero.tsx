"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Bell, Search } from "lucide-react";
import { getInitials, MOCK_USER } from "@/lib/mock-user";
import { Trip, getTripActionHref } from "@/lib/mock-trips";

const UNREAD_NOTIFICATIONS = 3;

const QUICK_STARTS = [
  { label: "Start from Scratch", href: "/trips/create/loading" },
  { label: "Use a Template", href: "/templates" },
  { label: "Plan a Pilgrimage", href: "/pilgrimage" },
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=1800&q=80";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const STATS_ORDER = [
  ["active", "Active"],
  ["completed", "Completed"],
  ["draft", "Drafts"],
] as const;

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

function formatTripDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function daysUntil(dateStr: string) {
  return Math.round((new Date(`${dateStr}T00:00:00`).getTime() - Date.now()) / 86400000);
}

/** Three distinct hero states, driven entirely by real trip data (no
 *  per-state flags): a draft in progress always wins ("Continue where
 *  you left off"); otherwise the next upcoming confirmed trip ("Track
 *  Trip"); otherwise the brand-new, zero-trips welcome. See
 *  active-dashboard.tsx / empty-dashboard.tsx for how draftTrip/nextTrip
 *  are derived from the trips list. */
export function DashboardHero({
  name,
  roleLabel,
  draftTrip,
  nextTrip = null,
  counts,
}: {
  name: string;
  roleLabel: string;
  draftTrip: Trip | null;
  nextTrip?: Trip | null;
  counts: { active: number; completed: number; draft: number };
}) {
  const shouldReduce = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const totalTrips = counts.active + counts.completed + counts.draft;
  const showStats = totalTrips > 0;

  const mode: "draft" | "next" | "new" = draftTrip ? "draft" : nextTrip ? "next" : "new";
  const heroImage = (draftTrip ?? nextTrip)?.imageUrl || FALLBACK_IMAGE;
  const stepNumber = draftTrip && typeof draftTrip.progress === "number" ? Math.max(1, Math.min(5, Math.ceil(draftTrip.progress / 20))) : null;
  const nextDays = nextTrip ? daysUntil(nextTrip.startDate) : null;

  const eyebrow = mode === "draft" ? "Continue where you left off" : mode === "next" ? "Your next trip" : "Welcome to TripConsole";
  const headline = mode === "draft" ? draftTrip!.name : mode === "next" ? nextTrip!.name : `Good morning, ${name}`;
  const paragraph =
    mode === "draft"
      ? draftTrip!.location
      : mode === "next"
        ? `${formatTripDate(nextTrip!.startDate)} · ${nextDays! > 0 ? `${nextDays} days to go` : nextDays === 0 ? "Today" : "Trip in progress"}`
        : "Create your first professional trip listing and bring every service together.";
  const primaryLabel = mode === "draft" ? "Continue Setup" : mode === "next" ? "Track Trip" : "Create Your First Listing";
  const primaryHref = mode === "draft" ? getTripActionHref(draftTrip!) : mode === "next" ? getTripActionHref(nextTrip!) : "/trips/new";

  const fadeUp = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } } };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } } }}
      className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[20px] sm:min-h-[380px]"
    >
      <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
      {/* Dark gradient only over the left ~55% (where the text lives) —
         the hills stay bright and visible on the right. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to right, rgba(45,62,80,0.82) 0%, rgba(45,62,80,0.5) 40%, rgba(45,62,80,0) 70%)" }}
      />

      <motion.div variants={fadeUp} className="relative z-10 flex items-center justify-between gap-3 p-5 sm:p-8">
        <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
          {roleLabel} &middot; {todayLabel()}
        </span>

        <div className="flex items-center gap-4">
          <div className="relative hidden items-center sm:flex">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search trips and templates"
              className="flex h-8 w-8 shrink-0 items-center justify-center text-white/90 transition-colors hover:text-white"
            >
              <Search size={17} />
            </button>
            <motion.input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search trips, templates..."
              animate={{ width: searchOpen ? 180 : 0, opacity: searchOpen ? 1 : 0, marginLeft: searchOpen ? 8 : 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="border-b border-white/30 bg-transparent font-body text-sm text-white placeholder:text-white/50 focus:outline-none"
            />
          </div>

          <Link href="/notifications" aria-label="Notifications" className="relative flex h-8 w-8 items-center justify-center text-white/90 transition-colors hover:text-white">
            <Bell size={18} />
            {UNREAD_NOTIFICATIONS > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange text-[9px] font-bold text-white">
                {UNREAD_NOTIFICATIONS}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            aria-label="Profile"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-body text-sm font-semibold text-navy transition-transform hover:scale-105"
          >
            {getInitials(MOCK_USER.fullName)}
          </Link>
        </div>
      </motion.div>

      <div className="relative z-10 p-5 pb-8 sm:p-8 sm:pb-10">
        <div className="max-w-2xl">
          <motion.div variants={fadeUp}>
            <p className="font-body text-sm font-semibold uppercase tracking-[0.14em] text-mint">{eyebrow}</p>
            <h1 className="mt-2 font-serif text-[42px] leading-[0.98] text-white sm:text-[56px] lg:text-[60px]">{headline}</h1>
            <p className="mt-3 max-w-md font-body text-base text-white/80">{paragraph}</p>
          </motion.div>

          {mode === "draft" && stepNumber !== null && (
            <motion.div variants={fadeUp} className="mt-5 max-w-xs">
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/25">
                <div className="h-full rounded-full bg-orange transition-all duration-500" style={{ width: `${draftTrip!.progress}%` }} />
              </div>
              <p className="mt-2 font-body text-xs text-white/75">
                Step {stepNumber} of 5 &middot; {draftTrip!.currentStepLabel ?? "Trip setup"}
              </p>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={primaryHref}
                className="group inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
              >
                {primaryLabel}
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {mode === "new" ? (
                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_STARTS.map((option) => (
                    <Link
                      key={option.href}
                      href={option.href}
                      className="rounded-xl border border-white/25 px-4 py-2.5 font-body text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/10"
                    >
                      {option.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link href="/trips/new" className="font-body text-sm font-medium text-white/90 underline-offset-4 transition-colors hover:text-white hover:underline">
                  + New Trip
                </Link>
              )}
            </div>

            {showStats && (
              <div className="flex shrink-0 items-center gap-5">
                {STATS_ORDER.map(([key, label]) => (
                  <Link key={key} href={`/trips?status=${key}`} className="group flex flex-col items-start">
                    <span className="font-serif text-2xl text-white transition-colors group-hover:text-mint">{counts[key]}</span>
                    <span className="font-body text-[10px] font-semibold uppercase tracking-wide text-white/60">{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
