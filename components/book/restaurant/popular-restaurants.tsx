"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { RestaurantCard } from "./restaurant-card";
import { Button } from "@/components/ui/button";
import { searchPopularRestaurants } from "@/lib/restaurant-booking-api";
import { getRestaurantBookingDraft } from "@/lib/restaurant-booking-state";
import type { Restaurant } from "@/lib/restaurant-booking-data";

const STEPS = ["Search", "Restaurant", "Menu", "Guests", "Payment", "Confirmation"];

export function PopularRestaurants() {
  const router = useRouter();
  const draft = getRestaurantBookingDraft();
  const search = draft.search;
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);

  useEffect(() => {
    if (!search) {
      router.replace("/book/restaurant");
      return;
    }
    searchPopularRestaurants(search.destinationId).then(setRestaurants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search) return null;

  if (!restaurants) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={1} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-navy/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={1} />

      <button type="button" onClick={() => router.push("/book/restaurant")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to search
      </button>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Popular in {search.destinationLabel}</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Top-rated restaurants</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {search.guestCount} guest{search.guestCount === 1 ? "" : "s"} &middot; {search.reservationDate} &middot; {search.reservationTime}
        </p>
      </div>

      {restaurants.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-10 text-center">
          <p className="font-heading text-base font-semibold text-navy">No popular picks here yet.</p>
          <button type="button" onClick={() => router.push("/book/restaurant/listings")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
            Browse all restaurants instead
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} onSelect={() => router.push(`/book/restaurant/${r.id}`)} />
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <Button type="button" variant="outline" onClick={() => router.push("/book/restaurant/listings")}>
          Browse All Restaurants in {search.destinationLabel.split(",")[0]} <ArrowRight size={14} className="ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
