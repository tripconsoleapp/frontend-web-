import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { VehicleBookingSuccess } from "@/components/book/vehicle/booking-success";

export default function BookVehicleSuccessRoute() {
  return (
    <AppShell>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />}>
        <VehicleBookingSuccess />
      </Suspense>
    </AppShell>
  );
}
