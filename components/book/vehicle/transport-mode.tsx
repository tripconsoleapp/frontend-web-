"use client";

/**
 * Transport-mode selection — Private Operator vs KSRTC.
 *
 * IMPORTANT: this intentionally does NOT import or call
 * lib/transport-eligibility.ts (the Trip Builder's 20-passenger KSRTC
 * eligibility rule). Both options are always selectable here, regardless
 * of passenger count — see the audit note in lib/vehicle-booking-state.ts.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CarFront, Bus } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { getVehicleBookingDraft, saveTransportMode } from "@/lib/vehicle-booking-state";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];

export function TransportModeSelect() {
  const router = useRouter();
  const draft = getVehicleBookingDraft();
  const search = draft.search;

  useEffect(() => {
    if (!search) router.replace("/book/vehicle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search) return null;

  function choose(mode: "private" | "ksrtc") {
    saveTransportMode(mode);
    router.push(mode === "private" ? "/book/vehicle/type" : "/book/vehicle/ksrtc/listings");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={1} />

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Choose transport mode</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">How would you like to travel?</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {search.pickupLabel} &rarr; {search.dropLabel} &middot; {search.passengers} Passenger{search.passengers === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => choose("private")}
          className="group flex flex-col items-start gap-3 rounded-2xl border border-navy/10 bg-white p-6 text-left transition-shadow hover:shadow-lg"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-navy">
            <CarFront size={22} />
          </span>
          <p className="font-heading text-lg font-semibold text-navy">Private Operator</p>
          <p className="font-body text-sm text-text-grey">Choose a vehicle type and book a dedicated car, tempo traveller, mini bus, or sleeper coach for your group.</p>
          <span className="mt-1 font-body text-xs font-semibold text-orange group-hover:underline">Continue &rarr;</span>
        </button>

        <button type="button" onClick={() => choose("ksrtc")} className="group flex flex-col items-start gap-3 rounded-2xl border border-navy/10 bg-white p-6 text-left transition-shadow hover:shadow-lg">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-navy">
            <Bus size={22} />
          </span>
          <p className="font-heading text-lg font-semibold text-navy">KSRTC</p>
          <p className="font-body text-sm text-text-grey">Book individual seats on a scheduled KSRTC bus service for this route.</p>
          <span className="mt-1 font-body text-xs font-semibold text-orange group-hover:underline">Continue &rarr;</span>
        </button>
      </div>
    </div>
  );
}
