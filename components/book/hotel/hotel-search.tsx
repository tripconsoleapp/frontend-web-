"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HotelBookingStepper } from "./booking-stepper";
import { GuestSelector, type GuestSelection, guestSummaryLabel } from "./guest-selector";
import { FormError } from "@/components/ui/form-error";
import { Button } from "@/components/ui/button";
import { HOTEL_DESTINATIONS } from "@/lib/hotel-booking-data";
import { getHotelBookingDraft, saveSearchCriteria } from "@/lib/hotel-booking-state";

/** The user's local calendar date — not toISOString(), which reports the
 *  UTC date and can be a day off from "today" in positive-offset zones. */
function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Pure UTC calendar arithmetic — avoids the local-midnight→UTC round-trip
 *  that silently drops a day in timezones ahead of UTC (e.g. India). */
function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const inMs = new Date(`${checkIn}T00:00:00`).getTime();
  const outMs = new Date(`${checkOut}T00:00:00`).getTime();
  return Math.round((outMs - inMs) / 86_400_000);
}

export function HotelSearch() {
  const router = useRouter();

  // sessionStorage isn't available during SSR, so every piece of state here
  // must start at a plain, hardcoded value that's identical on the server
  // and the client's first (pre-effect) render — the real restore-or-default
  // logic (below) only runs after mount, same pattern used to fix the
  // Review/Voucher hydration mismatches.
  const [destinationId, setDestinationId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState<GuestSelection>({ adults: 2, children: 0, childrenAges: [], rooms: 1 });
  const [error, setError] = useState<string | null>(null);

  // Restore a saved search after mount, or fall back to the default dates
  // (today + 7 days, 2 nights) when there isn't one — this is a client-only
  // state update, so it's always safe post-hydration.
  useEffect(() => {
    const existing = getHotelBookingDraft().search;
    if (existing) {
      setDestinationId(existing.destinationId ?? "");
      setCheckIn(existing.checkIn ?? "");
      setCheckOut(existing.checkOut ?? "");
      setGuests({
        adults: existing.adults ?? 2,
        children: existing.children ?? 0,
        childrenAges: existing.childrenAges ?? [],
        rooms: existing.rooms ?? 1,
      });
    } else {
      const start = addDaysISO(todayISO(), 7);
      setCheckIn(start);
      setCheckOut(addDaysISO(start, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nights = nightsBetween(checkIn, checkOut);

  function handleSearch() {
    if (!destinationId) return setError("Please select a destination.");
    if (!checkIn) return setError("Please select a check-in date.");
    if (!checkOut) return setError("Please select a check-out date.");
    if (nights < 1) return setError("Check-out must be after check-in.");
    if (guests.adults < 1) return setError("At least 1 adult is required.");
    if (guests.rooms < 1) return setError("At least 1 room is required.");
    if (guests.children < 0) return setError("Children count cannot be negative.");

    setError(null);
    const destination = HOTEL_DESTINATIONS.find((d) => d.id === destinationId)!;
    saveSearchCriteria({
      destinationId,
      destinationLabel: `${destination.name}, ${destination.region}`,
      checkIn,
      checkOut,
      adults: guests.adults,
      children: guests.children,
      childrenAges: guests.childrenAges,
      rooms: guests.rooms,
    });
    router.push("/book/hotel/listings");
  }

  const selectedDestination = HOTEL_DESTINATIONS.find((d) => d.id === destinationId);

  return (
    <div className="flex flex-col gap-8 pb-16">
      <HotelBookingStepper activeIndex={0} />

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Just one thing to book?</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Book a Hotel</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Search and book a single stay — no trip planning required.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white p-6">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Destination</label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            >
              <option value="">Find your stay in Kerala</option>
              {HOTEL_DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}, {d.region}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Check-in</label>
              <input
                type="date"
                value={checkIn}
                min={todayISO()}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut && e.target.value >= checkOut) setCheckOut(addDaysISO(e.target.value, 1));
                }}
                className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Check-out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn ? addDaysISO(checkIn, 1) : todayISO()}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
              />
            </div>
          </div>

          {nights > 0 && (
            <p className="font-body text-xs text-text-grey">
              {nights} {nights === 1 ? "night" : "nights"}
            </p>
          )}

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Guests</label>
            <div className="mt-2">
              <GuestSelector value={guests} onChange={setGuests} />
            </div>
          </div>

          {error && <FormError message={error} />}

          <Button type="button" variant="accent" size="lg" className="mt-1" onClick={handleSearch}>
            Search Hotels
          </Button>
        </div>

        <div className="hidden overflow-hidden rounded-2xl lg:block">
          <div className="relative h-full min-h-[320px] w-full">
            <Image
              src={selectedDestination?.heroImage ?? "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=900&q=80"}
              alt=""
              fill
              sizes="380px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="font-heading text-lg font-semibold text-white">{selectedDestination ? `${selectedDestination.name}, ${selectedDestination.region}` : "Find your stay in Kerala"}</p>
              <p className="mt-1 font-body text-xs text-white/80">{guestSummaryLabel(guests)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
