"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";
import { cn } from "@/lib/cn";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { ActivityCard } from "./activity-card";
import { searchActivities, type ActivitySortKey } from "@/lib/activity-booking-api";
import { getActivityCategories } from "@/lib/activity-booking-data";
import { getActivityBookingDraft } from "@/lib/activity-booking-state";
import type { Activity, ActivityCategory } from "@/lib/activity-booking-data";

const STEPS = ["Search", "Activity", "Guests", "Payment", "Confirmation"];

const SORTS: { id: ActivitySortKey; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "rating", label: "Rating" },
  { id: "price_low", label: "Price: Low to High" },
  { id: "duration", label: "Duration" },
];

export function ActivityListings() {
  const router = useRouter();
  const draft = getActivityBookingDraft();
  const search = draft.search;

  const [loaded, setLoaded] = useState(false);
  const [all, setAll] = useState<Activity[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<ActivitySortKey>("recommended");
  const [category, setCategory] = useState<ActivityCategory | "any">("any");
  const [minRating, setMinRating] = useState<0 | 4 | 4.5>(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!search) {
      router.replace("/book/activity");
      return;
    }
    searchActivities(search.destinationId).then((results) => {
      setAll(results);
      setLoaded(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryOptions = search ? getActivityCategories(search.destinationId) : [];

  const filtered = useMemo(() => {
    let list = all.filter((a) => {
      if (searchText && !`${a.name} ${a.category} ${a.location}`.toLowerCase().includes(searchText.toLowerCase())) return false;
      if (category !== "any" && a.category !== category) return false;
      if (minRating > 0 && a.rating < minRating) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "duration") return a.durationHours - b.durationHours;
      if (sortBy === "price_low") return Math.min(...a.ticketTypes.map((t) => t.price)) - Math.min(...b.ticketTypes.map((t) => t.price));
      return b.rating * b.reviewCount - a.rating * a.reviewCount;
    });
    return list;
  }, [all, searchText, category, minRating, sortBy]);

  const hasActiveFilters = category !== "any" || minRating > 0;

  if (!search) return null;

  if (!loaded) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book an Activity" steps={STEPS} activeIndex={1} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <BookingStepper title="Book an Activity" steps={STEPS} activeIndex={1} />

      <button type="button" onClick={() => router.push("/book/activity/popular")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to popular picks
      </button>

      <div>
        <h1 className="font-heading text-xl font-bold text-navy">Activities in {search.destinationLabel.split(",")[0]}</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {search.adults + search.children} participant{search.adults + search.children === 1 ? "" : "s"} &middot; {search.activityDate}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search activity, category, or area..."
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
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Category</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory("any")}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                  category === "any" ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                )}
              >
                Any
              </button>
              {categoryOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                    category === c ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                  )}
                >
                  {c}
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
          {filtered.length} {filtered.length === 1 ? "activity" : "activities"} available
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
        {filtered.map((a) => (
          <ActivityCard key={a.id} activity={a} onSelect={() => router.push(`/book/activity/${a.id}`)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-10 text-center">
          <p className="font-heading text-base font-semibold text-navy">No activities match your filters.</p>
          <button
            type="button"
            onClick={() => {
              setCategory("any");
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
