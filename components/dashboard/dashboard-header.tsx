"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MOCK_USER, getInitials } from "@/lib/mock-user";

const UNREAD_NOTIFICATIONS = 3;

export function DashboardHeader({
  name,
  roleLabel,
}: {
  name: string;
  roleLabel: string;
}) {
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-heading text-3xl font-bold leading-tight text-navy">
          Good morning, {name}
        </h1>
        <p className="mt-1 font-body text-base text-text-grey">
          {roleLabel} workspace
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <label className="relative hidden lg:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-grey"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trips, templates..."
            className="w-64 rounded-full border border-navy/10 bg-navy/[0.03] py-2.5 pl-10 pr-4 font-body text-sm text-navy placeholder:text-text-grey focus:border-navy/30 focus:outline-none"
          />
        </label>

        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/[0.04] text-navy transition-colors hover:bg-navy/[0.08]"
        >
          <Bell size={19} />
          {UNREAD_NOTIFICATIONS > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[10px] font-bold text-white ring-2 ring-white">
              {UNREAD_NOTIFICATIONS}
            </span>
          )}
        </Link>

        <Link
          href="/profile"
          aria-label="Profile"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy font-body text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          {getInitials(MOCK_USER.fullName)}
        </Link>

        <Link
          href="/trips/new"
          className={buttonVariants({ variant: "accent", size: "sm", className: "whitespace-nowrap" })}
        >
          + New Listing
        </Link>
      </div>
    </div>
  );
}
