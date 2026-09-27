"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Bell, Search } from "lucide-react";
import { cn } from "@/lib/cn";
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

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

/** Replaces the old header + workspace-hero + quick-overview trio with one
 *  merged, image-led hero: greeting, primary action, and the trip-count
 *  strip all live in a single editorial band instead of three stacked
 *  generic rectangles. */
export function DashboardHero({
  name,
  roleLabel,
  draftTrip,
  counts,
}: {
  name: string;
  roleLabel: string;
  draftTrip: Trip | null;
  counts: { active: number; completed: number; draft: number };
}) {
  const shouldReduce = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const totalTrips = counts.active + counts.completed + counts.draft;
  const showStats = totalTrips > 0;

  const heroImage = draftTrip?.imageUrl || FALLBACK_IMAGE;

  const fadeUp = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } } };

  return (
    <div>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } } }}
        className="relative flex min-h-[440px] flex-col justify-between overflow-hidden rounded-3xl sm:min-h-[500px]"
      >
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-transparent to-transparent" />

        <motion.div variants={fadeUp} className="relative z-10 flex items-center justify-between gap-3 p-5 sm:p-8">
          <span className="rounded-full bg-white/10 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wide text-white/85 backdrop-blur-sm">
            {roleLabel} &middot; {todayLabel()}
          </span>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <motion.div
                animate={{ width: searchOpen ? 220 : 40 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="flex h-10 items-center overflow-hidden rounded-full bg-white/15 backdrop-blur-sm"
              >
                <button
                  type="button"
                  onClick={() => setSearchOpen((v) => !v)}
                  aria-label="Search trips and templates"
                  className="flex h-10 w-10 shrink-0 items-center justify-center text-white"
                >
                  <Search size={16} />
                </button>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search trips, templates..."
                  className={cn("h-full bg-transparent pr-4 font-body text-sm text-white placeholder:text-white/60 focus:outline-none", !searchOpen && "pointer-events-none opacity-0")}
                />
              </motion.div>
            </div>

            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <Bell size={17} />
              {UNREAD_NOTIFICATIONS > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10px] font-bold text-white ring-2 ring-navy">
                  {UNREAD_NOTIFICATIONS}
                </span>
              )}
            </Link>

            <Link
              href="/profile"
              aria-label="Profile"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-body text-sm font-semibold text-navy transition-transform hover:scale-105"
            >
              {getInitials(MOCK_USER.fullName)}
            </Link>
          </div>
        </motion.div>

        <div className="relative z-10 flex flex-col gap-6 p-5 pb-10 sm:p-8 sm:pb-12">
          <motion.div variants={fadeUp}>
            <p className="font-body text-sm font-semibold uppercase tracking-[0.14em] text-mint">
              {draftTrip ? "Continue where you left off" : totalTrips > 0 ? "Ready for your next journey?" : "Welcome to TripConsole"}
            </p>
            <h1 className="mt-2 max-w-2xl font-heading text-4xl font-bold leading-[1.02] text-white sm:text-5xl">
              {draftTrip ? draftTrip.name : `Good morning, ${name}`}
            </h1>
            <p className="mt-3 max-w-md font-body text-base text-white/80">
              {draftTrip
                ? `${draftTrip.location} · ${draftTrip.currentStepLabel ?? "Trip setup"} in progress`
                : totalTrips > 0
                  ? "Start organizing your next professional trip listing."
                  : "Create your first professional trip listing and bring every service together."}
            </p>
          </motion.div>

          {draftTrip && typeof draftTrip.progress === "number" && (
            <motion.div variants={fadeUp} className="max-w-xs">
              <div className="flex items-center justify-between font-body text-sm text-white/85">
                <span>{draftTrip.currentStepLabel ?? "Trip setup"}</span>
                <span className="font-semibold">{draftTrip.progress}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-orange transition-all duration-500" style={{ width: `${draftTrip.progress}%` }} />
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
            <Link
              href={draftTrip ? getTripActionHref(draftTrip) : "/trips/new"}
              className="group inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
            >
              {draftTrip ? "Continue Setup" : totalTrips > 0 ? "Create New Listing" : "Create Your First Listing"}
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            {!draftTrip && totalTrips === 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {QUICK_STARTS.map((option) => (
                  <Link
                    key={option.href}
                    href={option.href}
                    className="rounded-full border border-white/25 px-4 py-2.5 font-body text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/10"
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            )}

            {draftTrip && (
              <Link
                href="/trips/new"
                className="rounded-full border border-white/25 px-5 py-3 font-body text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                + New Trip
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>

      {showStats && (
        <motion.div
          initial={shouldReduce ? undefined : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: shouldReduce ? 0 : 0.3 }}
          className="relative z-10 mx-4 -mt-8 grid grid-cols-3 divide-x divide-navy/10 overflow-hidden rounded-2xl border border-navy/[0.06] bg-white shadow-[0_20px_45px_-20px_rgba(45,62,80,0.3)] sm:mx-8"
        >
          {(
            [
              ["active", "Active", counts.active],
              ["completed", "Completed", counts.completed],
              ["draft", "Drafts", counts.draft],
            ] as const
          ).map(([key, label, value]) => (
            <Link key={key} href={`/trips?status=${key}`} className="group flex flex-col items-center gap-0.5 px-4 py-5 text-center transition-colors hover:bg-navy/[0.02] sm:py-6">
              <span className="font-heading text-2xl font-bold text-navy transition-colors group-hover:text-orange sm:text-3xl">{value}</span>
              <span className="font-body text-xs font-medium uppercase tracking-wide text-text-grey">{label}</span>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
