"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { VehicleBookingSummary } from "./booking-summary";
import { Button } from "@/components/ui/button";
import { getVehicleDetails, getKsrtcServiceDetails, calculateCombinationPrice, calculateKsrtcPrice, combinedCapacity } from "@/lib/vehicle-booking-api";
import { computeDistanceKm } from "@/lib/vehicle-booking-data";
import { getVehicleBookingDraft } from "@/lib/vehicle-booking-state";
import type { VehicleListing, KsrtcService } from "@/lib/vehicle-booking-data";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];
const WELCOME_DISCOUNT = 200;

export function VehicleBookingReview() {
  const router = useRouter();
  const draft = getVehicleBookingDraft();
  const search = draft.search;
  const isPrivate = draft.transportMode === "private";

  const [privateVehicles, setPrivateVehicles] = useState<VehicleListing[] | null>(null);
  const [ksrtcService, setKsrtcService] = useState<KsrtcService | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!search || !draft.transportMode || !draft.passengerDetails) {
      router.replace("/book/vehicle");
      return;
    }
    if (isPrivate) {
      Promise.all((draft.selectedVehicleIds ?? []).map((id) => getVehicleDetails(id))).then((vs) => {
        setPrivateVehicles(vs.filter((v): v is VehicleListing => v !== null));
        setLoaded(true);
      });
    } else {
      getKsrtcServiceDetails(draft.selectedKsrtcServiceId ?? "").then((s) => {
        setKsrtcService(s);
        setLoaded(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || !draft.transportMode || !draft.passengerDetails) return null;
  if (!loaded) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={3} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }

  const distanceKm = computeDistanceKm(search.pickupLocationId, search.dropLocationId);
  const pricing = isPrivate && privateVehicles ? calculateCombinationPrice(privateVehicles, distanceKm, search.isRoundTrip, WELCOME_DISCOUNT) : ksrtcService ? calculateKsrtcPrice(ksrtcService, search.passengers, WELCOME_DISCOUNT) : null;
  const combined = isPrivate && privateVehicles ? combinedCapacity(privateVehicles) : ksrtcService?.availableSeats ?? 0;

  const selectionSummary = isPrivate ? (
    <div className="flex flex-col gap-1.5">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Vehicles ({privateVehicles?.length ?? 0})</p>
      {privateVehicles?.map((veh) => (
        <div key={veh.id} className="flex items-center justify-between font-body text-sm text-navy">
          <span>{veh.name}</span>
          <span className="flex items-center gap-1 text-text-grey">
            <Users size={12} /> {veh.seatingCapacity}
          </span>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between font-body text-sm font-semibold text-navy">
        <span>Combined capacity</span>
        <span>{combined}</span>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between font-body text-sm text-navy">
      <span>{ksrtcService?.busType}</span>
      <span className="text-text-grey">
        {ksrtcService?.departureTime} &rarr; {ksrtcService?.arrivalTime}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-28">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={3} />

      <button type="button" onClick={() => router.push("/book/vehicle/passenger-details")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to passenger details
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Booking Review</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{isPrivate ? "Private Operator" : "KSRTC"}</h1>
            <p className="font-body text-sm text-text-grey">
              {search.pickupLabel} &rarr; {search.dropLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Passenger</p>
            <p className="mt-1 font-body text-sm text-navy">
              {draft.passengerDetails.firstName} {draft.passengerDetails.lastName}
            </p>
            <p className="font-body text-xs text-text-grey">
              {draft.passengerDetails.email} &middot; {draft.passengerDetails.phone}
            </p>
            {draft.passengerDetails.specialRequests && (
              <p className="mt-2 rounded-lg bg-navy/[0.03] px-3 py-2 font-body text-xs text-navy/80">
                &ldquo;{draft.passengerDetails.specialRequests}&rdquo; — subject to availability, not guaranteed.
              </p>
            )}
          </div>

          <Button type="button" variant="accent" size="lg" onClick={() => router.push("/book/vehicle/payment")}>
            Continue to Payment
          </Button>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <VehicleBookingSummary
            pickupLabel={search.pickupLabel}
            dropLabel={search.dropLabel}
            journeyDate={search.journeyDate}
            pickupTime={search.pickupTime}
            isRoundTrip={search.isRoundTrip}
            returnDate={search.returnDate}
            passengers={search.passengers}
            selectionSummary={selectionSummary}
            pricing={pricing ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
