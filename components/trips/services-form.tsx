"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BedDouble, Car, Ticket, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CreateStepper } from "@/components/trips/create-stepper";

type ServiceId = "vehicle" | "hotel" | "restaurant" | "activities";

const SERVICES: {
  id: ServiceId;
  title: string;
  description: string;
  icon: ReactNode;
  tiers: string[];
}[] = [
  {
    id: "vehicle",
    title: "Vehicle",
    description: "Transport for the full group, door to door.",
    icon: <Car size={20} />,
    tiers: ["Standard Coach", "AC Coach", "Mini Bus"],
  },
  {
    id: "hotel",
    title: "Hotel",
    description: "Stay arrangements at each overnight stop.",
    icon: <BedDouble size={20} />,
    tiers: ["Budget", "Standard", "Premium"],
  },
  {
    id: "restaurant",
    title: "Restaurant",
    description: "Meals booked in advance along the route.",
    icon: <UtensilsCrossed size={20} />,
    tiers: ["Local Kitchens", "Multi-cuisine"],
  },
  {
    id: "activities",
    title: "Activities",
    description: "Guided experiences at your destinations.",
    icon: <Ticket size={20} />,
    tiers: ["Nature & Trekking", "Cultural", "Adventure"],
  },
];

export function ServicesForm({ template }: { template?: string }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState<Record<ServiceId, boolean>>({
    vehicle: true,
    hotel: true,
    restaurant: false,
    activities: false,
  });
  const [tier, setTier] = useState<Record<ServiceId, string>>({
    vehicle: SERVICES[0].tiers[0],
    hotel: SERVICES[1].tiers[1],
    restaurant: SERVICES[2].tiers[0],
    activities: SERVICES[3].tiers[0],
  });

  const backHref = `/trips/create/destinations${
    template ? `?template=${template}` : ""
  }`;

  function handleNext() {
    router.push("/trips/create/itinerary");
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
      <CreateStepper activeIndex={2} />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Select Services
        </h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          Turn on what your group needs — you can fine-tune each one below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            className={cn(
              "flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-colors",
              enabled[service.id] ? "border-orange/30" : "border-navy/10"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    enabled[service.id]
                      ? "bg-orange/10 text-orange"
                      : "bg-navy/5 text-navy"
                  )}
                >
                  {service.icon}
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold text-navy">
                    {service.title}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-text-grey">
                    {service.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={enabled[service.id]}
                onCheckedChange={(checked) =>
                  setEnabled((current) => ({ ...current, [service.id]: checked }))
                }
                label={`Enable ${service.title}`}
              />
            </div>

            <AnimatePresence initial={false}>
              {enabled[service.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 border-t border-navy/10 pt-4">
                    {service.tiers.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setTier((current) => ({
                            ...current,
                            [service.id]: option,
                          }))
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-colors",
                          tier[service.id] === option
                            ? "border-orange bg-orange/10 text-orange"
                            : "border-navy/15 text-navy hover:border-navy/30"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <Link href={backHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
          Back
        </Link>
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className={buttonVariants({ variant: "accent", size: "lg" })}
        >
          Next: Itinerary &rarr;
        </motion.button>
      </div>
    </div>
  );
}
