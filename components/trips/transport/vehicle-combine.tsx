"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { VEHICLE_LISTINGS, getVehicleType } from "@/lib/mock-vehicle-catalog";
import {
  ServicesDraft,
  VehicleSelectionItem,
  getServicesDraft,
  saveServicesDraft,
} from "@/lib/listing-draft";
import { totalCapacity } from "@/lib/transport";
import { useTripContext } from "@/lib/use-trip-context";
import { TransportContextHeader } from "./transport-context-header";
import { CapacityBar } from "./capacity-bar";
import { buttonVariants } from "@/components/ui/button";

export function VehicleCombine({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { passengerCount, ready } = useTripContext();
  const [draft, setDraft] = useState<ServicesDraft | null>(null);

  useEffect(() => {
    setDraft(getServicesDraft());
  }, []);

  const templateQuery = template ? `?template=${template}` : "";
  const backHref = `/trips/create/services/vehicle/mismatch${templateQuery}`;

  const pending = draft?.vehicle.pending ?? [];
  const covered = totalCapacity(pending);
  const fits = ready && covered >= passengerCount;

  function persist(next: VehicleSelectionItem[]) {
    if (!draft) return;
    const updated = { ...draft, vehicle: { ...draft.vehicle, pending: next } };
    setDraft(updated);
    saveServicesDraft(updated);
  }

  function addVehicle(item: VehicleSelectionItem) {
    persist([...pending, item]);
  }

  function removeVehicle(id: string) {
    persist(pending.filter((v, i) => `${v.id}-${i}` !== id));
  }

  function handleContinue() {
    router.push(`/trips/create/services/vehicle/pricing${templateQuery}`);
  }

  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <TransportContextHeader backHref={backHref} eyebrow="Services · Transport · Combine Vehicles" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Build your transport combination
        </h1>
        <p className="mt-1 font-body text-base text-text-grey">
          Mix and match vehicles until your full group is covered.
        </p>
      </div>

      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <div className="flex items-center justify-between font-body text-sm text-navy">
          <span className="font-semibold">
            {covered} / {passengerCount || "—"} passengers covered
          </span>
        </div>
        <div className="mt-2">
          <CapacityBar covered={covered} required={passengerCount} />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {pending.map((v, i) => (
              <motion.div
                key={`${v.id}-${i}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: shouldReduce ? 0 : 0.2 }}
                className="flex items-center justify-between gap-3 rounded-xl bg-navy/[0.03] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-body text-sm font-semibold text-navy">
                    Vehicle {i + 1}: {v.name} — {v.capacity} seats
                  </p>
                  <p className="font-body text-xs text-text-grey">{v.provider}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-body text-sm font-semibold text-navy">
                    {formatCurrency(v.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVehicle(`${v.id}-${i}`)}
                    aria-label={`Remove vehicle ${i + 1}`}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-text-grey transition-colors hover:bg-destructive-soft hover:text-destructive"
                  >
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {pending.length === 0 && (
            <p className="font-body text-sm text-text-grey">
              No vehicles added yet — choose one below to get started.
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="font-body text-sm font-semibold text-navy">
          Select your next vehicle
        </p>
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } } }}
          className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {VEHICLE_LISTINGS.map((listing) => {
            const listingType = getVehicleType(listing.typeId);
            return (
              <motion.button
                key={listing.id}
                variants={item}
                type="button"
                onClick={() =>
                  addVehicle({
                    id: listing.id,
                    name: listingType?.name ?? "Vehicle",
                    capacity: listing.capacity,
                    provider: listing.operator,
                    price: listing.price,
                    source: listing.source,
                    ac: listing.ac,
                    rating: listing.rating,
                    trips: listing.trips,
                  })
                }
                className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-orange/40 hover:shadow-sm"
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={listing.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-semibold text-navy">
                    {listingType?.name} &middot; {listing.capacity} seats
                  </p>
                  <p className="truncate font-body text-xs text-text-grey">{listing.operator}</p>
                </div>
                <span className="shrink-0 font-body text-sm font-semibold text-navy">
                  {formatCurrency(listing.price)}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <span className="font-body text-sm text-text-grey">
          {fits ? "Your group is covered" : "Add more vehicles to cover your group"}
        </span>
        <motion.button
          type="button"
          whileHover={fits ? { y: -1 } : undefined}
          whileTap={fits ? { scale: 0.98 } : undefined}
          onClick={handleContinue}
          disabled={!fits}
          className={buttonVariants({
            variant: "accent",
            size: "lg",
            className: "disabled:cursor-not-allowed disabled:opacity-40",
          })}
        >
          Continue to Pricing &rarr;
        </motion.button>
      </div>
    </div>
  );
}
