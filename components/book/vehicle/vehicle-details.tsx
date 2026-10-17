"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Star, Users, Briefcase, ShieldCheck, Check } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { formatCurrency } from "@/lib/mock-trips";
import { getVehicleDetails } from "@/lib/vehicle-booking-api";
import { computeDistanceKm } from "@/lib/vehicle-booking-data";
import { getVehicleBookingDraft, toggleSelectedVehicle } from "@/lib/vehicle-booking-state";
import type { VehicleListing } from "@/lib/vehicle-booking-data";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];

export function VehicleDetails({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const draft = getVehicleBookingDraft();
  const search = draft.search;
  const [vehicle, setVehicle] = useState<VehicleListing | null | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>(draft.selectedVehicleIds ?? []);

  useEffect(() => {
    if (!search || draft.transportMode !== "private") {
      router.replace("/book/vehicle");
      return;
    }
    getVehicleDetails(vehicleId).then(setVehicle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  if (!search || draft.transportMode !== "private") return null;

  if (vehicle === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={2} />
        <div className="h-72 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }

  if (vehicle === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">Vehicle information could not be loaded.</p>
        <button type="button" onClick={() => router.push("/book/vehicle/listings")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to listings
        </button>
      </div>
    );
  }

  const distanceKm = computeDistanceKm(search.pickupLocationId, search.dropLocationId);
  const estimatedPrice = vehicle.baseFare + vehicle.perKmRate * distanceKm * (search.isRoundTrip ? 2 : 1);
  const selected = selectedIds.includes(vehicle.id);

  function handleToggle() {
    const next = toggleSelectedVehicle(vehicle!.id);
    setSelectedIds(next);
  }

  return (
    <div className="flex flex-col gap-8 pb-32">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={2} />

      <button type="button" onClick={() => router.push("/book/vehicle/listings")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to listings
      </button>

      <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-80">
        <Image src={vehicle.image} alt={vehicle.name} fill priority sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
      </div>

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">{vehicle.name}</h1>
        <p className="mt-1 font-body text-sm text-text-grey">{vehicle.operatorName}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex items-center gap-1 rounded-md bg-navy/5 px-2.5 py-1">
            <Star size={13} className="fill-orange text-orange" />
            <span className="font-body text-xs font-semibold text-navy">{vehicle.rating.toFixed(1)}</span>
          </span>
          <span className="font-body text-xs text-text-grey">{vehicle.reviewCount} reviews</span>
        </div>
      </div>

      <div className="rounded-2xl bg-navy/[0.03] px-4 py-3">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Your search</p>
        <p className="mt-1 font-body text-sm text-navy">
          {search.pickupLabel} &rarr; {search.dropLabel} &middot; ~{distanceKm} km
        </p>
        <p className="font-body text-sm text-navy">
          {new Date(`${search.journeyDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} &middot; {search.pickupTime} &middot; {search.passengers} Passenger
          {search.passengers === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 font-body text-sm text-navy sm:grid-cols-4">
        <span className="flex items-center gap-1.5">
          <Users size={14} /> {vehicle.seatingCapacity} seats
        </span>
        <span className="flex items-center gap-1.5">
          <Briefcase size={14} /> {vehicle.luggageCapacity}
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} />
          {vehicle.cancellation === "free" ? `Free cancellation (${vehicle.freeCancellationHoursBeforePickup ?? 6}h before)` : "Non-refundable"}
        </span>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Amenities</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {vehicle.amenities.map((a) => (
            <span key={a} className="rounded-full border border-navy/10 px-3 py-1.5 font-body text-xs text-navy">
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-navy/10 p-5">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Estimated Price</p>
        <p className="mt-1 font-body text-sm text-text-grey">
          Base fare {formatCurrency(vehicle.baseFare)} + {formatCurrency(vehicle.perKmRate)}/km &times; {distanceKm} km{search.isRoundTrip ? " × 2 (round trip)" : ""}
        </p>
        <p className="mt-2 font-heading text-xl font-bold text-navy">{formatCurrency(estimatedPrice)}</p>
        <p className="font-body text-[11px] text-text-grey">Before taxes and fees — shown in full on Review.</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-6 py-4 lg:left-60">
        <div>
          <p className="font-body text-sm font-semibold text-navy">{vehicle.name}</p>
          <p className="font-body text-xs text-text-grey">{formatCurrency(estimatedPrice)}</p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex items-center gap-1.5 rounded-full px-6 py-3 font-body text-sm font-semibold transition-colors ${selected ? "bg-navy text-white" : "bg-orange text-white hover:bg-orange/90"}`}
        >
          {selected ? (
            <>
              <Check size={14} /> Added to selection
            </>
          ) : (
            "Add this vehicle"
          )}
        </button>
      </div>
    </div>
  );
}
