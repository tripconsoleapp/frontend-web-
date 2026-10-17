"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { VehicleBookingSummary } from "./booking-summary";
import { CapacityStatus } from "./capacity-status";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/mock-trips";
import { getVehicleDetails, getKsrtcServiceDetails, calculateCombinationPrice, calculateKsrtcPrice, combinedCapacity } from "@/lib/vehicle-booking-api";
import { computeDistanceKm } from "@/lib/vehicle-booking-data";
import { getVehicleBookingDraft } from "@/lib/vehicle-booking-state";
import type { VehicleListing, KsrtcService } from "@/lib/vehicle-booking-data";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];

export function TransportConfirm() {
  const router = useRouter();
  const draft = getVehicleBookingDraft();
  const search = draft.search;

  const [privateVehicles, setPrivateVehicles] = useState<VehicleListing[] | null>(null);
  const [ksrtcService, setKsrtcService] = useState<KsrtcService | null>(null);
  const [loaded, setLoaded] = useState(false);

  const isPrivate = draft.transportMode === "private";
  const isKsrtc = draft.transportMode === "ksrtc";

  useEffect(() => {
    if (!search) {
      router.replace("/book/vehicle");
      return;
    }
    if (isPrivate) {
      const ids = draft.selectedVehicleIds ?? [];
      if (ids.length === 0) {
        router.replace("/book/vehicle/listings");
        return;
      }
      Promise.all(ids.map((id) => getVehicleDetails(id))).then((vehicles) => {
        setPrivateVehicles(vehicles.filter((v): v is VehicleListing => v !== null));
        setLoaded(true);
      });
    } else if (isKsrtc) {
      if (!draft.selectedKsrtcServiceId) {
        router.replace("/book/vehicle/ksrtc/listings");
        return;
      }
      getKsrtcServiceDetails(draft.selectedKsrtcServiceId).then((s) => {
        setKsrtcService(s);
        setLoaded(true);
      });
    } else {
      router.replace("/book/vehicle/mode");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search) return null;
  if (!loaded) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={2} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }

  const distanceKm = computeDistanceKm(search.pickupLocationId, search.dropLocationId);
  const pricing = isPrivate && privateVehicles ? calculateCombinationPrice(privateVehicles, distanceKm, search.isRoundTrip) : isKsrtc && ksrtcService ? calculateKsrtcPrice(ksrtcService, search.passengers) : null;
  const combined = isPrivate && privateVehicles ? combinedCapacity(privateVehicles) : isKsrtc && ksrtcService ? ksrtcService.availableSeats : 0;

  function handleConfirm() {
    router.push("/book/vehicle/passenger-details");
  }

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
    <div className="flex flex-col gap-1.5">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">KSRTC Service</p>
      <div className="flex items-center justify-between font-body text-sm text-navy">
        <span>{ksrtcService?.busType}</span>
        <span className="text-text-grey">
          {ksrtcService?.departureTime} &rarr; {ksrtcService?.arrivalTime}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={2} />

      <button
        type="button"
        onClick={() => router.push(isPrivate ? "/book/vehicle/listings" : "/book/vehicle/ksrtc/listings")}
        className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy"
      >
        <ArrowLeft size={14} /> Back to {isPrivate ? "vehicle listings" : "services"}
      </button>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Transport Confirmation</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{isPrivate ? "Confirm your vehicle arrangement" : "Confirm your KSRTC service"}</h1>
        <p className="mt-1 font-body text-xs text-text-grey">This confirms your selected transport arrangement — it is not yet a paid reservation.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          <CapacityStatus combined={combined} required={search.passengers} />
          <Button type="button" variant="accent" size="lg" onClick={handleConfirm} disabled={combined < search.passengers}>
            Confirm Transport Arrangement
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
          <p className="mt-2 font-body text-[11px] text-text-grey">{formatCurrency(pricing?.totalAmount ?? 0)} estimated — final total confirmed on Review.</p>
        </div>
      </div>
    </div>
  );
}
