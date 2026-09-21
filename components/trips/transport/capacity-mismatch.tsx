"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Layers, SlidersHorizontal, Truck } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { getServicesDraft, VehicleSelectionItem } from "@/lib/listing-draft";
import { useTripContext } from "@/lib/use-trip-context";
import { TransportContextHeader } from "./transport-context-header";

export function CapacityMismatch({
  source,
  typeId,
  template,
}: {
  source: "private" | "ksrtc";
  typeId?: string;
  template?: string;
}) {
  const shouldReduce = useReducedMotion();
  const { passengerCount, ready } = useTripContext();
  const [selected, setSelected] = useState<VehicleSelectionItem | null>(null);

  useEffect(() => {
    setSelected(getServicesDraft().vehicle.pending[0] ?? null);
  }, []);

  const query = template ? `&template=${template}` : "";
  const templateQuery = template ? `?template=${template}` : "";
  const resultsHref =
    source === "ksrtc"
      ? `/trips/create/services/vehicle/results?source=ksrtc${query}`
      : `/trips/create/services/vehicle/results?source=private${typeId ? `&type=${typeId}` : ""}${query}`;
  const backHref = resultsHref;

  const shortfall = selected && ready ? Math.max(0, passengerCount - selected.capacity) : 0;

  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <TransportContextHeader backHref={backHref} eyebrow="Services · Transport · Capacity Check" />

      <motion.div initial="hidden" animate="show" variants={item} className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-2xl bg-orange/5 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange/15 text-orange">
            <AlertTriangle size={19} />
          </span>
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">
              Capacity Mismatch
            </p>
            <h1 className="mt-1 font-heading text-xl font-bold text-navy">
              This vehicle doesn&apos;t cover your full group.
            </h1>
            <p className="mt-1 font-body text-sm text-text-grey">
              We can help you fix this — choose one of the options below.
            </p>
          </div>
        </div>

        {selected && (
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-navy/10 bg-white p-5 sm:grid-cols-3">
            <div>
              <p className="font-body text-xs uppercase tracking-wide text-text-grey">
                Selected vehicle
              </p>
              <p className="mt-0.5 font-heading text-base font-semibold text-navy">
                {selected.name} — {selected.capacity} seats
              </p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wide text-text-grey">
                Your group
              </p>
              <p className="mt-0.5 font-heading text-base font-semibold text-navy">
                {passengerCount} passengers
              </p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wide text-text-grey">
                Shortfall
              </p>
              <p className="mt-0.5 font-heading text-base font-semibold text-orange">
                {shortfall} passengers
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col gap-3">
        <OptionRow
          icon={Truck}
          title="Choose another vehicle"
          description="Select a vehicle with enough capacity for the entire group."
          ctaLabel="Browse larger vehicles"
          href={resultsHref}
        />
        <OptionRow
          icon={Layers}
          title="Combine vehicles"
          description="Use multiple vehicles to cover the full group."
          ctaLabel="Build vehicle combination"
          href={`/trips/create/services/vehicle/combine${templateQuery}`}
        />
        <OptionRow
          icon={SlidersHorizontal}
          title="Edit participants"
          description="Update the participant count if your group details changed."
          ctaLabel="Edit participants"
          href={`/trips/create/basics${templateQuery}`}
        />
      </div>
    </div>
  );
}

function OptionRow({
  icon: Icon,
  title,
  description,
  ctaLabel,
  href,
}: {
  icon: typeof Truck;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
          <Icon size={18} />
        </span>
        <div>
          <h3 className="font-heading text-base font-semibold text-navy">{title}</h3>
          <p className="mt-0.5 font-body text-sm text-text-grey">{description}</p>
        </div>
      </div>
      <span className="flex shrink-0 items-center gap-1 font-body text-sm font-semibold text-orange">
        {ctaLabel}
        <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
      </span>
    </Link>
  );
}
