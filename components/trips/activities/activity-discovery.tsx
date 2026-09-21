"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Check, Filter, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import {
  Activity,
  ActivityCategory,
  getActivitiesForDestination,
  getActivityCategories,
  getHiddenGemsForDestination,
} from "@/lib/mock-activity-catalog";
import { fitsGroup } from "@/lib/activity-plan";
import { ActivityContextHeader } from "./activity-context-header";
import { ActivityMap } from "./activity-map";

type SortKey = "best" | "price-low" | "rating" | "duration";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "best", label: "Recommended" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "rating", label: "Rating" },
  { id: "duration", label: "Duration" },
];

export function ActivityDiscovery({ destinationId, template }: { destinationId: string; template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const templateQuery = template ? `?template=${template}` : "";

  const destinationName = trip.stops.find((s) => s.id === destinationId)?.name ?? destinationId;

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("best");
  const [category, setCategory] = useState<ActivityCategory | "all">("all");
  const [minRating, setMinRating] = useState<0 | 4 | 4.5>(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const allActivities = useMemo(() => getActivitiesForDestination(destinationId), [destinationId]);
  const categories = useMemo(() => getActivityCategories(destinationId), [destinationId]);
  const hiddenGems = useMemo(() => getHiddenGemsForDestination(destinationId), [destinationId]);

  const filtered = useMemo(() => {
    let list = allActivities.filter((a) => {
      if (search && !`${a.name} ${a.category} ${a.location}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "all" && a.category !== category) return false;
      if (minRating > 0 && a.rating < minRating) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "price-low") return a.unitPrice - b.unitPrice;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "duration") return a.durationHours - b.durationHours;
      return Number(fitsGroup(b.capacity, trip.passengerCount)) - Number(fitsGroup(a.capacity, trip.passengerCount)) || b.rating - a.rating;
    });
    return list;
  }, [allActivities, search, category, minRating, sortBy, trip.passengerCount]);

  const hasActiveFilters = category !== "all" || minRating > 0;

  function clearFilters() {
    setCategory("all");
    setMinRating(0);
    setSearch("");
  }

  function goToActivity(a: Activity) {
    router.push(`/trips/create/services/activities/${destinationId}/activity/${a.id}${templateQuery}`);
  }

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } } };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ActivityContextHeader
        backHref={`/trips/create/services/activities${templateQuery}`}
        eyebrow={`Activities in ${destinationName}`}
        destinationName={destinationName}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search activities in ${destinationName}...`}
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

          <div className="flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors",
                category === "all" ? "border-navy bg-navy text-white" : "border-navy/15 text-navy hover:border-navy/30"
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors",
                  category === c ? "border-navy bg-navy text-white" : "border-navy/15 text-navy hover:border-navy/30"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-navy/10 bg-navy/[0.015] p-4">
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Rating</p>
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
                  {hasActiveFilters && (
                    <button type="button" onClick={clearFilters} className="font-body text-xs font-semibold text-orange underline underline-offset-2">
                      Clear all
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${sortBy}-${search}-${category}-${minRating}`}
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-5"
            >
              {filtered.map((a, index) => {
                const fits = fitsGroup(a.capacity, trip.passengerCount);
                return (
                  <motion.div
                    key={a.id}
                    variants={item}
                    layout
                    onMouseEnter={() => setHoveredId(a.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="flex flex-col overflow-hidden border-b border-navy/10 pb-5 sm:flex-row sm:gap-5"
                  >
                    <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-2xl sm:h-36 sm:w-56">
                      <Image
                        src={a.heroImage}
                        alt={a.name}
                        fill
                        sizes="(min-width: 640px) 224px, 100vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                      {sortBy === "best" && index === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-navy px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wide text-white">
                          Top Pick
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1.5 pt-3 sm:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading text-base font-semibold text-navy">{a.name}</h3>
                        <span className="flex shrink-0 items-center gap-1 font-body text-sm text-navy">
                          <Star size={13} className="fill-orange text-orange" /> {a.rating}
                          <span className="text-text-grey">({a.reviewCount})</span>
                        </span>
                      </div>
                      <p className="font-body text-xs text-text-grey">
                        {a.category} &middot; {a.durationHours} {a.durationHours === 1 ? "hour" : "hours"}
                      </p>
                      <span
                        className={cn(
                          "flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-medium",
                          fits ? "bg-mint/30 text-navy" : "bg-orange/10 text-orange"
                        )}
                      >
                        {fits ? (
                          <>
                            <Check size={12} /> Fits your group
                          </>
                        ) : (
                          `Capacity ${a.capacity} · group of ${trip.passengerCount} won’t fit`
                        )}
                      </span>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <p className="font-body text-sm text-navy">
                          <span className="font-heading text-lg font-bold">{formatCurrency(a.unitPrice)}</span>{" "}
                          <span className="text-xs text-text-grey">{a.pricingType === "per_person" ? "/ person" : "/ group"}</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => goToActivity(a)}
                          className="rounded-full bg-navy px-5 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-10 text-center">
              <p className="font-heading text-base font-semibold text-navy">No activities match these filters.</p>
              <button type="button" onClick={clearFilters} className="mt-1 font-body text-sm font-semibold text-orange underline underline-offset-2">
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-8 lg:h-fit">
          <div className="h-56 overflow-hidden rounded-2xl">
            <ActivityMap
              activities={filtered.map((a) => ({ id: a.id, name: a.name, lat: a.lat, lng: a.lng }))}
              hiddenGems={hiddenGems.map((g) => ({ id: g.id, name: g.name, lat: g.lat, lng: g.lng }))}
              selectedId={hoveredId}
            />
          </div>

          {hiddenGems.length > 0 && (
            <button
              type="button"
              onClick={() => router.push(`/trips/create/services/activities/${destinationId}/hidden-gems${templateQuery}`)}
              className="group flex flex-col gap-2 rounded-2xl bg-navy px-5 py-5 text-left transition-colors hover:bg-navy/95"
            >
              <span className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-mint">
                <Sparkles size={13} /> Discover Hidden Gems
              </span>
              <p className="font-body text-sm text-white/85">
                Looking for places beyond the usual tourist stops? Explore local viewpoints, quiet nature spots, and
                lesser-known places around {destinationName}.
              </p>
              <span className="font-body text-sm font-semibold text-white underline underline-offset-2 group-hover:text-mint">
                Explore Hidden Gems &rarr;
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
