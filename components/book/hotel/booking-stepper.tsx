"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

const STEPS = ["Search", "Hotel", "Guests", "Payment", "Confirmation"];

export function HotelBookingStepper({ activeIndex }: { activeIndex: number }) {
  const shouldReduce = useReducedMotion();

  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
        Book a Hotel &middot; Step {activeIndex + 1} of {STEPS.length}
      </p>
      <div className="flex w-full items-center">
        {STEPS.map((step, index) => (
          <div key={step} className={cn("flex items-center", index < STEPS.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-body text-xs font-semibold transition-colors duration-300",
                  index < activeIndex
                    ? "bg-orange text-white"
                    : index === activeIndex
                      ? "bg-orange text-white ring-4 ring-orange/15"
                      : "bg-navy/10 text-text-grey"
                )}
              >
                {index < activeIndex ? <Check size={13} /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden whitespace-nowrap font-body text-xs font-medium transition-colors duration-300 sm:block",
                  index === activeIndex ? "text-navy" : "text-text-grey/70"
                )}
              >
                {step}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className="relative mx-2 h-px flex-1 bg-navy/10">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-orange"
                  initial={{ width: 0 }}
                  animate={{ width: index < activeIndex ? "100%" : "0%" }}
                  transition={shouldReduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
