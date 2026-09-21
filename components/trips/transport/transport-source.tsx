"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Check, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { TransportContextHeader } from "./transport-context-header";

type Source = "private" | "ksrtc";

const SOURCES: {
  id: Source;
  title: string;
  description: string;
  icon: typeof Truck;
}[] = [
  {
    id: "private",
    title: "Private Operators",
    description: "Flexible operators and vehicles from verified providers.",
    icon: Truck,
  },
  {
    id: "ksrtc",
    title: "KSRTC",
    description: "Government-operated transport options.",
    icon: ShieldCheck,
  },
];

export function TransportSource({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const [selected, setSelected] = useState<Source | null>(null);

  // Entering the transport flow fresh always starts a new selection attempt.
  // The previously confirmed plan (`vehicle.vehicles`) is untouched — only
  // the in-progress `pending` slot is cleared.
  useEffect(() => {
    const draft = getServicesDraft();
    if (draft.vehicle.pending.length > 0) {
      saveServicesDraft({
        ...draft,
        vehicle: { ...draft.vehicle, pending: [] },
      });
    }
  }, []);

  const query = template ? `&template=${template}` : "";
  const backHref = `/trips/create/services${template ? `?template=${template}` : ""}`;

  function handleContinue() {
    if (!selected) return;
    if (selected === "ksrtc") {
      router.push(`/trips/create/services/vehicle/results?source=ksrtc${query}`);
    } else {
      router.push(`/trips/create/services/vehicle/type?source=private${query}`);
    }
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <div className="flex flex-col gap-6 pb-28">
      <TransportContextHeader
        backHref={backHref}
        eyebrow="Services · Transport"
      />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Find transport that fits your group.
        </h1>
        <p className="mt-1 font-body text-base text-text-grey">
          Choose how you&apos;d like to arrange transport for this trip.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {SOURCES.map((source) => {
          const Icon = source.icon;
          const isSelected = selected === source.id;
          return (
            <motion.button
              key={source.id}
              variants={item}
              type="button"
              onClick={() => setSelected(source.id)}
              aria-pressed={isSelected}
              className={cn(
                "relative flex flex-col items-start gap-3 rounded-2xl border bg-white p-6 text-left transition-all duration-200 hover:-translate-y-0.5",
                isSelected
                  ? "border-orange bg-orange/5 shadow-sm"
                  : "border-navy/10 hover:border-navy/25"
              )}
            >
              {isSelected && (
                <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-orange text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  isSelected ? "bg-orange/10 text-orange" : "bg-navy/5 text-navy"
                )}
              >
                <Icon size={20} />
              </span>
              <div>
                <h3 className="font-heading text-base font-semibold text-navy">
                  {source.title}
                </h3>
                <p className="mt-1 font-body text-sm text-text-grey">
                  {source.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <span className="font-body text-sm text-text-grey">
          {selected ? "Ready to continue" : "Choose a transport source"}
        </span>
        <motion.button
          type="button"
          whileHover={selected ? { y: -1 } : undefined}
          whileTap={selected ? { scale: 0.98 } : undefined}
          onClick={handleContinue}
          disabled={!selected}
          className={buttonVariants({
            variant: "accent",
            size: "lg",
            className: "disabled:cursor-not-allowed disabled:opacity-40",
          })}
        >
          Continue &rarr;
        </motion.button>
      </div>
    </div>
  );
}
