"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { VEHICLE_TYPES } from "@/lib/mock-vehicle-catalog";
import { useTripContext } from "@/lib/use-trip-context";
import { TransportContextHeader } from "./transport-context-header";

export function VehicleTypeSelect({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { passengerCount, ready } = useTripContext();

  const query = template ? `&template=${template}` : "";
  const backHref = `/trips/create/services/vehicle${template ? `?template=${template}` : ""}`;

  function chooseType(typeId: string) {
    router.push(`/trips/create/services/vehicle/results?source=private&type=${typeId}${query}`);
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <TransportContextHeader
        backHref={backHref}
        eyebrow="Services · Transport · Private Operators"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Choose a vehicle type
          </h1>
          <p className="mt-1 font-body text-base text-text-grey">
            We&apos;ll show vehicles that suit your group.
          </p>
        </div>
        {ready && passengerCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-navy/[0.03] px-4 py-2.5">
            <Users size={15} className="text-navy" />
            <div>
              <p className="font-body text-[10px] uppercase tracking-wide text-text-grey">
                Your Group
              </p>
              <p className="font-heading text-sm font-semibold text-navy">
                {passengerCount} passengers
              </p>
            </div>
          </div>
        )}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        {VEHICLE_TYPES.map((type, index) => (
          <motion.button
            key={type.id}
            variants={item}
            type="button"
            onClick={() => chooseType(type.id)}
            className={cn(
              "group flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-md sm:flex-row",
              index % 2 === 1 && "sm:flex-row-reverse"
            )}
          >
            <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-64">
              <Image
                src={type.imageUrl}
                alt={type.imageAlt}
                fill
                sizes="300px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2 p-6">
              <h3 className="font-heading text-xl font-semibold text-navy">
                {type.name}
              </h3>
              <p className="font-body text-sm font-medium text-navy/70">
                {type.capacityRange}
              </p>
              <p className="font-body text-sm text-text-grey">{type.idealFor}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="font-body text-sm text-text-grey">
                  From{" "}
                  <span className="font-heading text-base font-semibold text-navy">
                    {formatCurrency(type.fromPrice)}
                  </span>
                </p>
                <span className="flex items-center gap-1 font-body text-sm font-semibold text-orange">
                  View vehicles
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
