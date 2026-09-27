"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "motion/react";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import {
  VEHICLE_LISTINGS,
  VehicleListing,
  getVehicleType,
} from "@/lib/mock-vehicle-catalog";
import {
  VehicleSelectionItem,
  getServicesDraft,
  saveServicesDraft,
} from "@/lib/listing-draft";
import { useTripContext } from "@/lib/use-trip-context";
import { isKsrtcEligible } from "@/lib/transport-eligibility";
import { TransportContextHeader } from "./transport-context-header";

type SortKey = "best" | "price" | "rating";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "best", label: "Best Match" },
  { id: "price", label: "Price" },
  { id: "rating", label: "Rating" },
];

export function VehicleResults({
  source,
  typeId,
  template,
}: {
  source: "private" | "ksrtc";
  typeId?: string;
  template?: string;
}) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { passengerCount, isIndividual, ready } = useTripContext();
  const [sortBy, setSortBy] = useState<SortKey>("best");
  const [capacityFilter, setCapacityFilter] = useState<number | "any">("any");

  const type = typeId ? getVehicleType(typeId) : undefined;
  const query = template ? `&template=${template}` : "";
  const backHref =
    source === "ksrtc"
      ? `/trips/create/services/vehicle${template ? `?template=${template}` : ""}`
      : `/trips/create/services/vehicle/type?source=private${query}`;

  // The organizer should never land inside the KSRTC flow (direct link,
  // back button, stale bookmark) once the group no longer qualifies —
  // bounce back to the source picker, which itself won't offer KSRTC.
  const ksrtcBlocked = source === "ksrtc" && ready && !isKsrtcEligible(passengerCount, isIndividual);

  useEffect(() => {
    if (ksrtcBlocked) {
      router.replace(backHref);
    }
  }, [ksrtcBlocked, backHref, router]);

  const baseListings = useMemo(
    () =>
      VEHICLE_LISTINGS.filter(
        (v) => v.source === source && (!typeId || v.typeId === typeId)
      ),
    [typeId]
  );

  const capacityOptions = useMemo(
    () => Array.from(new Set(baseListings.map((v) => v.capacity))).sort((a, b) => a - b),
    [baseListings]
  );

  const listings = useMemo(() => {
    let list = baseListings;
    if (capacityFilter !== "any") list = list.filter((v) => v.capacity === capacityFilter);
    const sorted = [...list];
    if (sortBy === "price") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else
      sorted.sort(
        (a, b) =>
          Number(b.capacity >= passengerCount) - Number(a.capacity >= passengerCount) ||
          b.rating - a.rating
      );
    return sorted;
  }, [baseListings, capacityFilter, sortBy, passengerCount]);

  function handleSelect(listing: VehicleListing) {
    const listingType = getVehicleType(listing.typeId);
    const item: VehicleSelectionItem = {
      id: listing.id,
      name: listingType?.name ?? "Vehicle",
      capacity: listing.capacity,
      provider: listing.operator,
      price: listing.price,
      source: listing.source,
      ac: listing.ac,
      rating: listing.rating,
      trips: listing.trips,
    };
    const draft = getServicesDraft();
    saveServicesDraft({
      ...draft,
      vehicle: { ...draft.vehicle, pending: [item], lastSource: source, lastTypeId: typeId },
    });

    if (listing.capacity >= passengerCount) {
      router.push(`/trips/create/services/vehicle/pricing${template ? `?template=${template}` : ""}`);
    } else {
      router.push(
        `/trips/create/services/vehicle/mismatch?source=${source}${typeId ? `&type=${typeId}` : ""}${query}`
      );
    }
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
      };

  if (source === "ksrtc" && (!ready || ksrtcBlocked)) {
    return <div className="h-64" />;
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
      <TransportContextHeader
        backHref={backHref}
        eyebrow={`Services · Transport · ${source === "ksrtc" ? "KSRTC" : "Private Operators"}`}
      />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          {type ? type.name : "KSRTC Vehicles"}
        </h1>
        <p className="mt-1 font-body text-base text-text-grey">
          {listings.length} {listings.length === 1 ? "option" : "options"} available
          {ready && passengerCount > 0 ? ` for ${passengerCount} passengers` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSortBy(s.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors",
                sortBy === s.id
                  ? "border-orange bg-orange/10 text-orange"
                  : "border-navy/15 text-navy hover:border-navy/30"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {capacityOptions.length > 1 && (
          <label className="flex items-center gap-2 font-body text-sm text-text-grey">
            Seat Capacity
            <select
              value={capacityFilter}
              onChange={(e) =>
                setCapacityFilter(e.target.value === "any" ? "any" : Number(e.target.value))
              }
              className="rounded-lg border border-navy/15 bg-white px-2.5 py-1.5 font-body text-sm text-navy focus:border-navy focus:outline-none"
            >
              <option value="any">Any</option>
              {capacityOptions.map((c) => (
                <option key={c} value={c}>
                  {c} seats
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${sortBy}-${capacityFilter}`}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {listings.map((listing, index) => {
            const fits = listing.capacity >= passengerCount;
            const listingType = getVehicleType(listing.typeId);
            return (
              <motion.div
                key={listing.id}
                variants={item}
                layout
                className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={listing.imageUrl}
                    alt={listingType?.name ?? "Vehicle"}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  {sortBy === "best" && index === 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wide text-white">
                      Best Match
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-base font-semibold text-navy">
                      {listing.operator}
                    </h3>
                    <span className="flex shrink-0 items-center gap-1 font-body text-sm text-navy">
                      <Star size={13} className="fill-orange text-orange" />
                      {listing.rating}
                      <span className="text-text-grey">({listing.trips} trips)</span>
                    </span>
                  </div>

                  <p className="font-body text-sm text-text-grey">
                    {listingType?.name} &middot; {listing.capacity} seats &middot;{" "}
                    {listing.ac ? "AC" : "Non-AC"}
                  </p>

                  {ready && passengerCount > 0 && (
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
                        `Seats ${listing.capacity} of ${passengerCount} needed`
                      )}
                    </span>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-navy/10 pt-3">
                    <div>
                      <p className="font-body text-[10px] uppercase tracking-wide text-text-grey">
                        Trip total
                      </p>
                      <p className="font-heading text-lg font-bold text-navy">
                        {formatCurrency(listing.price)}
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelect(listing)}
                      className="rounded-full bg-navy px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
                    >
                      Select &rarr;
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {listings.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-10 text-center">
          <p className="font-heading text-base font-semibold text-navy">
            No vehicles match this filter.
          </p>
          <p className="font-body text-sm text-text-grey">
            Try a different seat capacity or vehicle type.
          </p>
          <button
            type="button"
            onClick={() => setCapacityFilter("any")}
            className="mt-1 font-body text-sm font-semibold text-orange underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
