"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { FormError } from "@/components/ui/form-error";
import { Button } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter-input";
import { VEHICLE_LOCATIONS } from "@/lib/vehicle-booking-data";
import { getVehicleBookingDraft, saveVehicleSearchCriteria } from "@/lib/vehicle-booking-state";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function VehicleSearch() {
  const router = useRouter();
  const existing = getVehicleBookingDraft().search;

  const [pickupLocationId, setPickupLocationId] = useState(existing?.pickupLocationId ?? "");
  const [dropLocationId, setDropLocationId] = useState(existing?.dropLocationId ?? "");
  const [journeyDate, setJourneyDate] = useState(existing?.journeyDate ?? "");
  const [pickupTime, setPickupTime] = useState(existing?.pickupTime ?? "09:00");
  const [passengers, setPassengers] = useState(existing?.passengers ?? 2);
  const [isRoundTrip, setIsRoundTrip] = useState(existing?.isRoundTrip ?? false);
  const [returnDate, setReturnDate] = useState(existing?.returnDate ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) setJourneyDate(todayISO());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function swapLocations() {
    setPickupLocationId(dropLocationId);
    setDropLocationId(pickupLocationId);
  }

  function handleSearch() {
    if (!pickupLocationId) return setError("Please select a pickup location.");
    if (!dropLocationId) return setError("Please select a drop-off location.");
    if (!journeyDate) return setError("Please select a journey date.");
    if (journeyDate < todayISO()) return setError("Journey date cannot be in the past.");
    if (!pickupTime) return setError("Please select a pickup time.");
    if (passengers < 1) return setError("At least 1 passenger is required.");
    if (isRoundTrip && !returnDate) return setError("Please select a return date for a round trip.");
    if (isRoundTrip && returnDate && returnDate < journeyDate) return setError("Return date must be on or after the journey date.");

    setError(null);
    const pickup = VEHICLE_LOCATIONS.find((l) => l.id === pickupLocationId)!;
    const drop = VEHICLE_LOCATIONS.find((l) => l.id === dropLocationId)!;
    saveVehicleSearchCriteria({
      pickupLocationId,
      dropLocationId,
      pickupLabel: `${pickup.name}, ${pickup.region}`,
      dropLabel: `${drop.name}, ${drop.region}`,
      journeyDate,
      pickupTime,
      passengers,
      isRoundTrip,
      returnDate: isRoundTrip ? returnDate : undefined,
    });
    router.push("/book/vehicle/mode");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={0} />

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Just one thing to book?</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Book a Vehicle</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Search and book a single ride — no trip planning required.</p>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Pickup location</label>
            <select
              value={pickupLocationId}
              onChange={(e) => setPickupLocationId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            >
              <option value="">Select pickup</option>
              {VEHICLE_LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}, {l.region}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={swapLocations}
            aria-label="Swap pickup and drop-off"
            className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full border border-navy/15 text-navy hover:bg-navy/5 sm:mb-0"
          >
            <ArrowRightLeft size={15} />
          </button>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Drop-off location</label>
            <select
              value={dropLocationId}
              onChange={(e) => setDropLocationId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            >
              <option value="">Select drop-off</option>
              {VEHICLE_LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}, {l.region}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Journey date</label>
            <input
              type="date"
              value={journeyDate}
              min={todayISO()}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Pickup time</label>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 font-body text-sm text-navy">
          <input type="checkbox" checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} className="h-4 w-4 accent-orange" />
          Round trip
        </label>

        {isRoundTrip && (
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Return date</label>
            <input
              type="date"
              value={returnDate}
              min={journeyDate || todayISO()}
              onChange={(e) => setReturnDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
          </div>
        )}

        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Passengers</label>
          <div className="mt-2">
            <CounterInput label="Passengers" value={passengers} onChange={setPassengers} min={1} max={40} />
          </div>
        </div>

        {error && <FormError message={error} />}

        <Button type="button" variant="accent" size="lg" className="mt-1" onClick={handleSearch}>
          Search Vehicles
        </Button>
      </div>
    </div>
  );
}
