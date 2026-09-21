"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Filter, Star, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { getHotelsForDestination, Hotel, PropertyType } from "@/lib/mock-hotel-catalog";
import { getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { nightsLabel } from "@/lib/hotel-stays";
import { HotelContextHeader } from "./hotel-context-header";
import { SkipStayDialog } from "./skip-stay-dialog";

type SortKey = "best" | "price-low" | "price-high" | "rating";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "best", label: "Best Match" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Guest Rating" },
];

const ALL_AMENITIES = ["Pool", "Wi-Fi", "Parking", "Restaurant", "AC", "Power Backup", "Room Service", "Laundry", "Elevator"];
const ALL_TYPES: PropertyType[] = ["Resort", "Heritage Stay", "Homestay", "Boutique Hotel", "Hotel"];

function cheapestRoom(hotel: Hotel) {
  return hotel.rooms.reduce((min, r) => (r.pricePerNight < min.pricePerNight ? r : min), hotel.rooms[0]);
}

export function HotelResults({ destinationId, template }: { destinationId: string; template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("best");
  const [maxPrice, setMaxPrice] = useState<number | "any">("any");
  const [minRating, setMinRating] = useState<0 | 3 | 4 | 5>(0);
  const [types, setTypes] = useState<Set<PropertyType>>(new Set());
  const [amenities, setAmenities] = useState<Set<string>>(new Set());
  const [breakfastOnly, setBreakfastOnly] = useState(false);
  const [freeCancellationOnly, setFreeCancellationOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);

  const stay = trip.ready
    ? getServicesDraft().hotel.stays.find((s) => s.destinationId === destinationId)
    : undefined;

  const templateQuery = template ? `?template=${template}` : "";
  const backHref = `/trips/create/services/hotel${templateQuery}`;

  const allHotels = useMemo(() => getHotelsForDestination(destinationId), [destinationId]);

  const filtered = useMemo(() => {
    let list = allHotels.filter((h) => {
      const cheapest = cheapestRoom(h);
      if (search && !`${h.name} ${h.locationLabel}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (maxPrice !== "any" && cheapest.pricePerNight > maxPrice) return false;
      if (minRating > 0 && h.rating < minRating) return false;
      if (types.size > 0 && !types.has(h.propertyType)) return false;
      if (amenities.size > 0 && ![...amenities].every((a) => h.amenities.includes(a))) return false;
      if (breakfastOnly && !h.rooms.some((r) => r.breakfastIncluded)) return false;
      if (freeCancellationOnly && !h.freeCancellationAvailable) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "price-low") return cheapestRoom(a).pricePerNight - cheapestRoom(b).pricePerNight;
      if (sortBy === "price-high") return cheapestRoom(b).pricePerNight - cheapestRoom(a).pricePerNight;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.rating - a.rating;
    });
    return list;
  }, [allHotels, search, maxPrice, minRating, types, amenities, breakfastOnly, freeCancellationOnly, sortBy]);

  function toggleSet<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  }

  function clearFilters() {
    setMaxPrice("any");
    setMinRating(0);
    setTypes(new Set());
    setAmenities(new Set());
    setBreakfastOnly(false);
    setFreeCancellationOnly(false);
    setSearch("");
  }

  const hasActiveFilters =
    maxPrice !== "any" || minRating > 0 || types.size > 0 || amenities.size > 0 || breakfastOnly || freeCancellationOnly;

  function goToHotel(hotel: Hotel) {
    router.push(`/trips/create/services/hotel/${destinationId}/${hotel.id}${templateQuery}`);
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <HotelContextHeader
        backHref={backHref}
        eyebrow="Select Hotels"
        stay={stay ? { destinationName: stay.destinationName, checkIn: stay.checkIn, checkOut: stay.checkOut, nights: stay.nights } : undefined}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hotel, resort, or area..."
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-body text-sm text-navy placeholder:text-text-grey/60 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 font-body text-sm font-medium transition-colors",
            hasActiveFilters ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
          )}
        >
          <Filter size={14} /> Filters {hasActiveFilters ? `(${[maxPrice !== "any", minRating > 0, types.size > 0, amenities.size > 0, breakfastOnly, freeCancellationOnly].filter(Boolean).length})` : ""}
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
            <div className="grid grid-cols-1 gap-5 rounded-2xl border border-navy/10 bg-navy/[0.015] p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Price / night</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["any", 2500, 4000, 6000] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setMaxPrice(p)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                        maxPrice === p ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                      )}
                    >
                      {p === "any" ? "Any" : `Under ${formatCurrency(p)}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Guest rating</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([0, 3, 4, 5] as const).map((r) => (
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
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Property type</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleSet(types, t, setTypes)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                        types.has(t) ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Meals &amp; cancellation</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setBreakfastOnly((v) => !v)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                      breakfastOnly ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                    )}
                  >
                    Breakfast included
                  </button>
                  <button
                    type="button"
                    onClick={() => setFreeCancellationOnly((v) => !v)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                      freeCancellationOnly ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                    )}
                  >
                    Free cancellation
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Amenities</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_AMENITIES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleSet(amenities, a, setAmenities)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                        amenities.has(a) ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-fit font-body text-xs font-semibold text-orange underline underline-offset-2 sm:col-span-2 lg:col-span-4"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-body text-sm text-text-grey">
          {filtered.length} {filtered.length === 1 ? "stay" : "stays"} available
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
          key={`${sortBy}-${search}-${maxPrice}-${minRating}-${types.size}-${amenities.size}-${breakfastOnly}-${freeCancellationOnly}`}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {filtered.map((hotel, index) => {
            const room = cheapestRoom(hotel);
            const nights = stay?.nights ?? 1;
            return (
              <motion.div
                key={hotel.id}
                variants={item}
                layout
                className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={hotel.heroImage}
                    alt={hotel.name}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {sortBy === "best" && index === 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wide text-white">
                      Best Match
                    </span>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-body text-[10px] font-semibold text-navy backdrop-blur-sm">
                    {hotel.propertyType}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-base font-semibold text-navy">{hotel.name}</h3>
                    <span className="flex shrink-0 items-center gap-1 font-body text-sm text-navy">
                      <Star size={13} className="fill-orange text-orange" /> {hotel.rating}
                    </span>
                  </div>
                  <p className="font-body text-xs text-text-grey">{hotel.locationLabel}</p>
                  <p className="font-body text-xs text-text-grey">
                    {hotel.ratingLabel} &middot; {hotel.reviewCount} reviews
                  </p>
                  <p className="font-body text-xs text-navy/70">{hotel.amenities.slice(0, 3).join(" · ")}</p>
                  <p className="font-body text-xs text-text-grey">{room.name} available</p>

                  <div className="mt-auto flex items-center justify-between border-t border-navy/10 pt-3">
                    <div>
                      <p className="font-heading text-lg font-bold text-navy">
                        {formatCurrency(room.pricePerNight)} <span className="font-body text-xs font-normal text-text-grey">/ night</span>
                      </p>
                      <p className="font-body text-xs text-text-grey">
                        {formatCurrency(room.pricePerNight * nights)} for {nightsLabel(nights)}
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => goToHotel(hotel)}
                      className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
                    >
                      View Hotel &rarr;
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-10 text-center">
          <p className="font-heading text-base font-semibold text-navy">No stays match these filters.</p>
          <button type="button" onClick={clearFilters} className="mt-1 font-body text-sm font-semibold text-orange underline underline-offset-2">
            Clear filters
          </button>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setSkipOpen(true)}
          className="font-body text-sm font-medium text-text-grey underline underline-offset-2 transition-colors hover:text-navy"
        >
          Not staying here? Skip this stay
        </button>
      </div>

      <SkipStayDialog
        open={skipOpen}
        destinationName={stay?.destinationName ?? ""}
        onConfirm={() => {
          const draft = getServicesDraft();
          const next = draft.hotel.stays.map((s) =>
            s.destinationId === destinationId ? { ...s, status: "skipped" as const, hotel: null, rooms: [], total: 0 } : s
          );
          saveServicesDraft({ ...draft, hotel: { ...draft.hotel, stays: next } });
          router.push(`/trips/create/services/hotel${templateQuery}`);
        }}
        onCancel={() => setSkipOpen(false)}
      />
    </div>
  );
}
