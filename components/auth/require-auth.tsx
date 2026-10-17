"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/** "Join a Scheduled Trip" is its own separate, independent-participant
 *  booking flow (see /app/pilgrimage/scheduled/**) — untouched in Phase 1,
 *  and per the audit it has no backend concept of a logged-in participant
 *  at all. It rendered with no login requirement before this change and
 *  must keep doing so; everything else under AppShell is gated. */
// TEMP-TEST-ONLY: the four standalone mock booking flows added below for
// local frontend-only testing while the backend is down. None of these
// flows call authedFetch or the backend (verified by grep before this
// change) — they're pure sessionStorage-backed mock state. Must be
// removed before this task is considered done — see conversation record
// for the exact restoration diff.
const PUBLIC_PATH_PREFIXES = ["/pilgrimage/scheduled", "/book/hotel", "/book/vehicle", "/book/restaurant", "/book/activity"];

function isPublicPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Gates every other page rendered inside AppShell behind a real session.
 *  Redirects to /login once we're certain there's no valid session (never
 *  mid-check — "loading" renders a placeholder, not a redirect, so a page
 *  never flashes and then bounces the user out). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const exempt = isPublicPath(pathname);

  useEffect(() => {
    if (!exempt && status === "unauthenticated") router.replace("/login");
  }, [exempt, status, router]);

  if (exempt) return <>{children}</>;

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
      </div>
    );
  }

  return <>{children}</>;
}
