"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { formatCurrency } from "@/lib/mock-trips";
import { getServicesDraft, VehicleSelectionItem } from "@/lib/listing-draft";
import { buildPricingBreakdown, totalCapacity } from "@/lib/transport";
import { useTripContext } from "@/lib/use-trip-context";
import { TransportContextHeader } from "./transport-context-header";
import { buttonVariants } from "@/components/ui/button";

export function TransportPricing({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { passengerCount } = useTripContext();
  const [vehicles, setVehicles] = useState<VehicleSelectionItem[]>([]);

  useEffect(() => {
    setVehicles(getServicesDraft().vehicle.pending);
  }, []);

  const templateQuery = template ? `?template=${template}` : "";
  const backHref =
    vehicles.length > 1
      ? `/trips/create/services/vehicle/combine${templateQuery}`
      : `/trips/create/services/vehicle${templateQuery}`;

  const breakdown = buildPricingBreakdown(vehicles);
  const covered = totalCapacity(vehicles);

  function handleContinue() {
    router.push(`/trips/create/services/vehicle/confirm${templateQuery}`);
  }

  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <TransportContextHeader backHref={backHref} eyebrow="Services · Transport · Pricing" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Pricing Details
        </h1>
        <p className="mt-1 font-body text-base text-text-grey">
          A transparent breakdown of your transport cost.
        </p>
      </div>

      <motion.div initial="hidden" animate="show" variants={item} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-5">
          {vehicles.map((v, i) => (
            <div key={`${v.id}-${i}`} className="flex items-center gap-3">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-navy/5" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm font-semibold text-navy">
                  {vehicles.length > 1 ? `Vehicle ${i + 1}: ` : ""}
                  {v.name} &middot; {v.capacity} seats
                </p>
                <p className="truncate font-body text-xs text-text-grey">{v.provider}</p>
              </div>
              <span className="shrink-0 font-body text-sm font-semibold text-navy">
                {formatCurrency(v.price)}
              </span>
            </div>
          ))}
          {passengerCount > 0 && (
            <p className="border-t border-navy/10 pt-3 font-body text-xs text-text-grey">
              {covered} seats for {passengerCount} passengers
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
            Fare Breakdown
          </p>
          <div className="mt-3 flex flex-col gap-2 font-body text-sm text-navy">
            <div className="flex items-center justify-between">
              <span className="text-text-grey">Base Fare</span>
              <span>{formatCurrency(breakdown.baseFare)}</span>
            </div>
            {breakdown.driverAllowance > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-grey">Driver Allowance</span>
                <span>{formatCurrency(breakdown.driverAllowance)}</span>
              </div>
            )}
            {breakdown.nightHalt > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-grey">Night Halt</span>
                <span>{formatCurrency(breakdown.nightHalt)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-text-grey">Tolls &amp; Parking</span>
              <span>{formatCurrency(breakdown.tollsAndParking)}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
            <span className="font-body text-sm font-semibold text-navy">Total</span>
            <span className="font-heading text-xl font-bold text-navy">
              {formatCurrency(breakdown.total)}
            </span>
          </div>
          <p className="mt-2 font-body text-xs text-text-grey">
            Pricing is fixed — operator charge after booking confirmed.
          </p>
        </div>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <span className="font-body text-sm text-text-grey">Total</span>
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className={buttonVariants({ variant: "accent", size: "lg" })}
        >
          Continue to Confirmation &rarr;
        </motion.button>
      </div>
    </div>
  );
}
