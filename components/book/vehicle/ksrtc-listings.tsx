"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { formatCurrency } from "@/lib/mock-trips";
import { searchKsrtcServices } from "@/lib/vehicle-booking-api";
import { getVehicleBookingDraft } from "@/lib/vehicle-booking-state";
import type { KsrtcService } from "@/lib/vehicle-booking-data";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];

export function KsrtcListings() {
  const router = useRouter();
  const draft = getVehicleBookingDraft();
  const search = draft.search;

  const [results, setResults] = useState<KsrtcService[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!search || draft.transportMode !== "ksrtc") {
      router.replace("/book/vehicle");
      return;
    }
    searchKsrtcServices(search)
      .then(setResults)
      .catch(() => setError("We couldn't load KSRTC services right now. Please try again."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || draft.transportMode !== "ksrtc") return null;

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={2} />

      <button type="button" onClick={() => router.push("/book/vehicle/mode")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to transport mode
      </button>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">KSRTC</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">
          {search.pickupLabel} &rarr; {search.dropLabel}
        </h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {new Date(`${search.journeyDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} &middot; {search.passengers} Passenger{search.passengers === 1 ? "" : "s"}
        </p>
        <p className="mt-1 font-body text-[11px] text-text-grey">Mock KSRTC schedule shown for demonstration — not live inventory.</p>
      </div>

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
          <p className="font-body text-sm text-text-grey">{error}</p>
        </div>
      )}

      {!error && results === null && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 w-full animate-pulse rounded-2xl border border-navy/10 bg-navy/[0.03]" />
          ))}
        </div>
      )}

      {!error && results !== null && results.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
          <p className="font-heading text-base font-semibold text-navy">No KSRTC services found for this route.</p>
          <p className="font-body text-sm text-text-grey">Mock schedules are only available for a few popular Kerala routes.</p>
          <button type="button" onClick={() => router.push("/book/vehicle/mode")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
            Try Private Operator instead
          </button>
        </div>
      )}

      {!error && results !== null && results.length > 0 && (
        <div className="flex flex-col gap-3">
          {results.map((s) => {
            const fits = s.availableSeats >= search.passengers;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => router.push(`/book/vehicle/ksrtc/${s.id}`)}
                className="flex flex-col gap-2 rounded-2xl border border-navy/10 bg-white p-4 text-left transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-heading text-base font-semibold text-navy">{s.busType}</p>
                  <p className="flex items-center gap-1.5 font-body text-xs text-text-grey">
                    <Clock size={12} /> {s.departureTime} &rarr; {s.arrivalTime}
                  </p>
                  <p className="flex items-center gap-1.5 font-body text-xs text-text-grey">
                    <Users size={12} /> {s.availableSeats} of {s.totalSeats} seats available
                    {!fits && <span className="font-semibold text-destructive"> &middot; not enough for your group</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg font-bold text-navy">{formatCurrency(s.farePerSeat)}</p>
                  <p className="font-body text-[11px] text-text-grey">per seat</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
