"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { RestaurantCard } from "./restaurant-card";
import { FormError } from "@/components/ui/form-error";
import { Button } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter-input";
import { RESTAURANT_DESTINATIONS } from "@/lib/restaurant-booking-data";
import { searchPopularRestaurants } from "@/lib/restaurant-booking-api";
import type { Restaurant } from "@/lib/restaurant-booking-data";
import { getRestaurantBookingDraft, saveRestaurantSearchCriteria } from "@/lib/restaurant-booking-state";

const STEPS = ["Search", "Restaurant", "Menu", "Guests", "Payment", "Confirmation"];

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function RestaurantSearch() {
  const router = useRouter();
  const existing = getRestaurantBookingDraft().search;

  const [destinationId, setDestinationId] = useState(existing?.destinationId ?? "");
  const [reservationDate, setReservationDate] = useState(existing?.reservationDate ?? "");
  const [reservationTime, setReservationTime] = useState(existing?.reservationTime ?? "19:30");
  const [guestCount, setGuestCount] = useState(existing?.guestCount ?? 2);
  const [error, setError] = useState<string | null>(null);
  const [popular, setPopular] = useState<Restaurant[]>([]);

  useEffect(() => {
    if (!existing) setReservationDate(todayISO());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!destinationId) {
      setPopular([]);
      return;
    }
    searchPopularRestaurants(destinationId).then(setPopular);
  }, [destinationId]);

  const selectedDestination = RESTAURANT_DESTINATIONS.find((d) => d.id === destinationId);

  /** Validates and persists the search criteria. Returns false (and shows
   *  the error inline) without navigating anywhere if the form isn't
   *  complete yet — used by both the main search button and the "Popular
   *  in Kerala" teaser cards, since clicking a teaser must not skip past
   *  criteria validation. */
  function trySubmitSearch(): boolean {
    if (!destinationId) {
      setError("Please select a destination.");
      return false;
    }
    if (!reservationDate) {
      setError("Please select a reservation date.");
      return false;
    }
    if (reservationDate < todayISO()) {
      setError("Reservation date cannot be in the past.");
      return false;
    }
    if (!reservationTime) {
      setError("Please select a reservation time.");
      return false;
    }
    if (guestCount < 1) {
      setError("At least 1 guest is required.");
      return false;
    }

    setError(null);
    const destination = RESTAURANT_DESTINATIONS.find((d) => d.id === destinationId)!;
    saveRestaurantSearchCriteria({
      destinationId,
      destinationLabel: `${destination.name}, ${destination.region}`,
      reservationDate,
      reservationTime,
      guestCount,
    });
    return true;
  }

  function handleSearch() {
    if (trySubmitSearch()) router.push("/book/restaurant/popular");
  }

  function handleSelectPopular(restaurantId: string) {
    if (trySubmitSearch()) router.push(`/book/restaurant/${restaurantId}`);
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={0} />

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Just one thing to book?</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Book a Restaurant</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Find a table in Kerala — no trip planning required.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white p-6">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Where to?</label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            >
              <option value="">Find your table in Kerala</option>
              {RESTAURANT_DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}, {d.region}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Date</label>
              <input
                type="date"
                value={reservationDate}
                min={todayISO()}
                onChange={(e) => setReservationDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Time</label>
              <input
                type="time"
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
                className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
              />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Guests</label>
            <div className="mt-2">
              <CounterInput label="Guests" value={guestCount} onChange={setGuestCount} min={1} max={20} />
            </div>
          </div>

          {error && <FormError message={error} />}

          <Button type="button" variant="accent" size="lg" className="mt-1" onClick={handleSearch}>
            Find Restaurants
          </Button>
        </div>

        <div className="hidden overflow-hidden rounded-2xl lg:block">
          <div className="relative h-full min-h-[320px] w-full">
            <Image
              src={selectedDestination?.heroImage ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"}
              alt=""
              fill
              sizes="380px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="font-heading text-lg font-semibold text-white">{selectedDestination ? `${selectedDestination.name}, ${selectedDestination.region}` : "Find a table in Kerala"}</p>
              <p className="mt-1 font-body text-xs text-white/80">
                {guestCount} Guest{guestCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {popular.length > 0 && (
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-text-grey">Popular in Kerala</p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {popular.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} onSelect={() => handleSelectPopular(r.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
