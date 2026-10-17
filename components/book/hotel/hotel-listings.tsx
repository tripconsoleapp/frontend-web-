"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { HotelBookingStepper } from "./booking-stepper";
import { HotelCard } from "./hotel-card";
import { FiltersPanel } from "./filters-panel";
import { searchHotels, type HotelSearchFilters, type HotelSearchResult, type SortOrder } from "@/lib/hotel-booking-api";
import { getHotelBookingDraft, saveHotelSelection } from "@/lib/hotel-booking-state";

function ListingSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white">
      <div className="h-44 w-full animate-pulse bg-navy/[0.06]" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-navy/[0.06]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-navy/[0.06]" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-navy/[0.06]" />
      </div>
    </div>
  );
}

export function HotelListings() {
  const router = useRouter();
  const draft = getHotelBookingDraft();
  const search = draft.search;

  const [results, setResults] = useState<HotelSearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HotelSearchFilters>({});
  const [sort, setSort] = useState<SortOrder>("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!search) {
      router.replace("/book/hotel");
      return;
    }
    let cancelled = false;
    setResults(null);
    setError(null);
    searchHotels(search, filters, sort)
      .then((r) => {
        if (!cancelled) setResults(r);
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't load hotels right now. Please try again.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search?.destinationId, search?.checkIn, search?.checkOut, search?.adults, search?.children, search?.rooms, filters, sort]);

  function retry() {
    setError(null);
    setResults(null);
    if (!search) return;
    searchHotels(search, filters, sort)
      .then(setResults)
      .catch(() => setError("We couldn't load hotels right now. Please try again."));
  }

  function viewHotel(hotelId: string) {
    saveHotelSelection(hotelId);
    router.push(`/book/hotel/${hotelId}`);
  }

  if (!search) return null;

  return (
    <div className="flex flex-col gap-6 pb-16">
      <HotelBookingStepper activeIndex={1} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-navy">{search.destinationLabel}</h1>
          <p className="font-body text-sm text-text-grey">
            {new Date(`${search.checkIn}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} &ndash;{" "}
            {new Date(`${search.checkOut}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} &middot; {search.adults} Adult
            {search.adults === 1 ? "" : "s"}
            {search.children > 0 ? ` · ${search.children} Child${search.children === 1 ? "" : "ren"}` : ""} &middot; {search.rooms} Room
            {search.rooms === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/book/hotel")}
          className="font-body text-xs font-semibold text-orange underline underline-offset-2"
        >
          Edit search
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <FiltersPanel filters={filters} onFiltersChange={setFilters} sort={sort} onSortChange={setSort} />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-4 py-2 font-body text-xs font-semibold text-navy lg:hidden"
          >
            <SlidersHorizontal size={14} /> Filters &amp; Sort
          </button>

          {error && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
              <p className="font-body text-sm text-text-grey">{error}</p>
              <button type="button" onClick={retry} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
                Retry
              </button>
            </div>
          )}

          {!error && results === null && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingSkeleton key={i} />
              ))}
            </div>
          )}

          {!error && results !== null && results.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
              <p className="font-heading text-base font-semibold text-navy">No hotels match your filters.</p>
              <p className="font-body text-sm text-text-grey">Try adjusting your filters or search dates.</p>
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setFilters({})} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
                  Clear filters
                </button>
                <button type="button" onClick={() => router.push("/book/hotel")} className="font-body text-sm font-semibold text-navy underline underline-offset-2">
                  Adjust search
                </button>
              </div>
            </div>
          )}

          {!error && results !== null && results.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((r) => (
                <HotelCard key={r.hotel.id} result={r} onView={() => viewHotel(r.hotel.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end bg-navy/40 lg:hidden">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold text-navy">Filters &amp; Sort</h2>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close" className="rounded-full p-1 text-text-grey hover:bg-navy/5">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4">
              <FiltersPanel filters={filters} onFiltersChange={setFilters} sort={sort} onSortChange={setSort} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
