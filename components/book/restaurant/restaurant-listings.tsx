"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";
import { cn } from "@/lib/cn";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { RestaurantCard } from "./restaurant-card";
import { searchRestaurants, type RestaurantSortKey } from "@/lib/restaurant-booking-api";
import { getRestaurantBookingDraft } from "@/lib/restaurant-booking-state";
import type { Restaurant } from "@/lib/restaurant-booking-data";

const STEPS = ["Search", "Restaurant", "Menu", "Guests", "Payment", "Confirmation"];

const SORTS: { id: RestaurantSortKey; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "rating", label: "Rating" },
  { id: "price_low", label: "Price: Low to High" },
  { id: "distance", label: "Distance" },
];

export function RestaurantListings() {
  const router = useRouter();
  const draft = getRestaurantBookingDraft();
  const search = draft.search;

  const [loaded, setLoaded] = useState(false);
  const [all, setAll] = useState<Restaurant[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<RestaurantSortKey>("recommended");
  const [diet, setDiet] = useState<"any" | "veg" | "veg-and-non-veg">("any");
  const [minRating, setMinRating] = useState<0 | 4 | 4.5>(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!search) {
      router.replace("/book/restaurant");
      return;
    }
    searchRestaurants(search.destinationId).then((results) => {
      setAll(results);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = all.filter((r) => {
      if (searchText && !`${r.name} ${r.cuisine} ${r.locationLabel}`.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (diet !== "any" && r.dietType !== diet) return false;
      if (minRating > 0 && r.rating < minRating) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "distance") return a.distanceFromCenterKm - b.distanceFromCenterKm;
      if (sortBy === "price_low") return a.priceTier.length - b.priceTier.length;
      return b.rating * b.reviewCount - a.rating * a.reviewCount;
    });
    return list;
  }, [all, searchText, diet, minRating, sortBy]);

  const hasActiveFilters = diet !== "any" || minRating > 0;

  if (!search) return null;

  if (!loaded) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={1} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={1} />

      <button type="button" onClick={() => router.push("/book/restaurant/popular")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to popular picks
      </button>

      <div>
        <h1 className="font-heading text-xl font-bold text-navy">Restaurants in {search.destinationLabel.split(",")[0]}</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {search.guestCount} guest{search.guestCount === 1 ? "" : "s"} &middot; {search.reservationDate} &middot; {search.reservationTime}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search restaurant, cuisine, or area..."
          className="w-full flex-1 rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-body text-sm text-navy placeholder:text-text-grey/60 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
        />
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 font-body text-sm font-medium transition-colors",
            hasActiveFilters ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
          )}
        >
          <Filter size={14} /> Filters
        </button>
      </div>

      {filtersOpen && (
        <div className="grid grid-cols-1 gap-5 rounded-2xl border border-navy/10 bg-navy/[0.015] p-5 sm:grid-cols-2">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Diet</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["any", "Any"],
                  ["veg", "Veg only"],
                  ["veg-and-non-veg", "Veg + Non-Veg"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDiet(value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                    diet === value ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Rating</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {([0, 4, 4.5] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setMinRating(r)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                    minRating === r ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                  )}
                >
                  {r === 0 ? "Any" : `${r}+`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-body text-sm text-text-grey">
          {filtered.length} {filtered.length === 1 ? "restaurant" : "restaurants"} available
        </p>
        <div className="flex items-center gap-2 overflow-x-auto">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSortBy(s.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors",
                sortBy === s.id ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {filtered.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} onSelect={() => router.push(`/book/restaurant/${r.id}`)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-10 text-center">
          <p className="font-heading text-base font-semibold text-navy">No restaurants match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setDiet("any");
              setMinRating(0);
              setSearchText("");
            }}
            className="font-body text-sm font-semibold text-orange underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
