import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityBookingSuccess } from "@/components/book/activity/booking-success";

export default function BookActivitySuccessRoute() {
  return (
    <AppShell>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />}>
        <ActivityBookingSuccess />
      </Suspense>
    </AppShell>
  );
}
