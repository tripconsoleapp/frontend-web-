import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { RestaurantBookingSuccess } from "@/components/book/restaurant/booking-success";

export default function BookRestaurantSuccessRoute() {
  return (
    <AppShell>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />}>
        <RestaurantBookingSuccess />
      </Suspense>
    </AppShell>
  );
}
