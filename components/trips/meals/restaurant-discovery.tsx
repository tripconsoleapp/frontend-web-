"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Check, Filter, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTripContext } from "@/lib/use-trip-context";
import { getRestaurantsForDestination, Restaurant } from "@/lib/mock-restaurant-catalog";
import { MEAL_LABELS, fitsGroup, parseMealKey } from "@/lib/meal-plan";
import { MealInstance, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { MealContextHeader } from "./meal-context-header";
import { SkipMealDialog } from "./skip-meal-dialog";

type SortKey = "best" | "rating" | "price-low" | "distance";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "best", label: "Recommended" },
  { id: "rating", label: "Rating" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "distance", label: "Distance" },
];

const PRICE_RANK: Record<string, number> = { "₹": 1, "₹₹": 2, "₹₹₹": 3 };

export function RestaurantDiscovery({ mealKey: key, template }: { mealKey: string; template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const { dayIndex, mealType } = parseMealKey(key);
  const templateQuery = template ? `?template=${template}` : "";

  // sessionStorage isn't available during SSR, so the first paint must
  // render with no meal context and defer the real read to an effect.
  const [meal, setMeal] = useState<MealInstance | null>(null);
  useEffect(() => {
    const found = getServicesDraft().restaurant.meals.find((m) => m.dayIndex === dayIndex && m.mealType === mealType);
    setMeal(found ?? null);
  }, [dayIndex, mealType]);
  const destinationId = meal?.destinationId ?? "";

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("best");
  const [diet, setDiet] = useState<"any" | "veg" | "veg-and-non-veg">("any");
  const [minRating, setMinRating] = useState<0 | 4 | 4.5>(0);
  const [cuisines, setCuisines] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);

  const allRestaurants = useMemo(
    () => getRestaurantsForDestination(destinationId, mealType),
    [destinationId, mealType]
  );

  const cuisineOptions = useMemo(() => Array.from(new Set(allRestaurants.map((r) => r.cuisine))), [allRestaurants]);

  const filtered = useMemo(() => {
    let list = allRestaurants.filter((r) => {
      if (search && !`${r.name} ${r.cuisine} ${r.locationLabel}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (diet !== "any" && r.dietType !== diet) return false;
      if (minRating > 0 && r.rating < minRating) return false;
      if (cuisines.size > 0 && !cuisines.has(r.cuisine)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-low") return PRICE_RANK[a.priceTier] - PRICE_RANK[b.priceTier];
      if (sortBy === "distance") return a.distanceFromCenterKm - b.distanceFromCenterKm;
      return Number(fitsGroup(b.capacity, trip.passengerCount)) - Number(fitsGroup(a.capacity, trip.passengerCount)) || b.rating - a.rating;
    });
    return list;
  }, [allRestaurants, search, diet, minRating, cuisines, sortBy, trip.passengerCount]);

  const hasActiveFilters = diet !== "any" || minRating > 0 || cuisines.size > 0;

  function toggleCuisine(c: string) {
    setCuisines((current) => {
      const next = new Set(current);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  }

  function clearFilters() {
    setDiet("any");
    setMinRating(0);
    setCuisines(new Set());
    setSearch("");
  }

  function goToRestaurant(r: Restaurant) {
    router.push(`/trips/create/services/restaurant/${key}/restaurant/${r.id}${templateQuery}`);
  }

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } } };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <MealContextHeader
        backHref={`/trips/create/services/restaurant${templateQuery}`}
        eyebrow={`Restaurants in ${meal?.destinationName ?? ""}`}
        meal={meal ? { destinationName: meal.destinationName, dayIndex: meal.dayIndex, mealType: meal.mealType } : undefined}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-5 rounded-2xl border border-navy/10 bg-navy/[0.015] p-5 sm:grid-cols-3">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Diet</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([
                    ["any", "Any"],
                    ["veg", "Veg only"],
                    ["veg-and-non-veg", "Veg + Non-Veg"],
                  ] as const).map(([value, label]) => (
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

              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Cuisine</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cuisineOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCuisine(c)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                        cuisines.has(c) ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="w-fit font-body text-xs font-semibold text-orange underline underline-offset-2 sm:col-span-3">
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${sortBy}-${search}-${diet}-${minRating}-${cuisines.size}`}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {filtered.map((r) => {
            const fits = fitsGroup(r.capacity, trip.passengerCount);
            return (
              <motion.div
                key={r.id}
                variants={item}
                layout
                className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <Image src={r.heroImage} alt={r.name} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 hover:scale-105" />
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-body text-[10px] font-semibold text-navy backdrop-blur-sm">
                    {r.priceTier}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-base font-semibold text-navy">{r.name}</h3>
                    <span className="flex shrink-0 items-center gap-1 font-body text-sm text-navy">
                      <Star size={13} className="fill-orange text-orange" /> {r.rating}
                    </span>
                  </div>
                  <p className="font-body text-xs text-text-grey">{r.cuisine}</p>
                  <p className="font-body text-xs text-text-grey">
                    {r.reviewCount.toLocaleString("en-IN")} reviews &middot; {r.locationLabel}
                  </p>
                  <span
                    className={cn(
                      "flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-medium",
                      fits ? "bg-mint/30 text-navy" : "bg-orange/10 text-orange"
                    )}
                  >
                    {fits ? (
                      <>
                        <Check size={12} /> Suitable for {trip.passengerCount} guests
                      </>
                    ) : (
                      `⚠ May not accommodate your group`
                    )}
                  </span>
                  <p className="mt-auto border-t border-navy/10 pt-3 font-body text-xs text-text-grey">
                    {r.mealTypes.map((mt) => MEAL_LABELS[mt]).join(" · ")}
                  </p>
                  <button
                    type="button"
                    onClick={() => goToRestaurant(r)}
                    className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
                  >
                    View Menu &rarr;
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-10 text-center">
          <p className="font-heading text-base font-semibold text-navy">
            No restaurants match your group and meal requirements.
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={clearFilters} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
              Clear filters
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setSkipOpen(true)}
          className="font-body text-sm font-medium text-text-grey underline underline-offset-2 transition-colors hover:text-navy"
        >
          Don&rsquo;t need a meal arranged? Skip this meal
        </button>
      </div>

      <SkipMealDialog
        open={skipOpen}
        mealType={mealType}
        destinationName={meal?.destinationName ?? ""}
        onConfirm={() => {
          const draft = getServicesDraft();
          const next = draft.restaurant.meals.map((m) =>
            m.dayIndex === dayIndex && m.mealType === mealType
              ? { ...m, status: "skipped" as const, restaurant: null, planningMode: null, selections: [], responses: [], shareToken: null, total: 0 }
              : m
          );
          saveServicesDraft({ ...draft, restaurant: { ...draft.restaurant, meals: next } });
          router.push(`/trips/create/services/restaurant${templateQuery}`);
        }}
        onCancel={() => setSkipOpen(false)}
      />
    </div>
  );
}
