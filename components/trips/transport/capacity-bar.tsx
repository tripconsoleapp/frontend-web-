"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

export function CapacityBar({
  covered,
  required,
}: {
  covered: number;
  required: number;
}) {
  const shouldReduce = useReducedMotion();
  const fits = covered >= required;
  const pct = required > 0 ? Math.min(100, Math.round((covered / required) * 100)) : 0;

  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
        <motion.div
          className={cn("h-full rounded-full", fits ? "bg-mint" : "bg-orange")}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: shouldReduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="mt-1.5 font-body text-xs text-text-grey">
        {fits ? (
          <span className="font-medium text-navy">
            ✓ Covers your group{covered > required ? ` · ${covered - required} seats to spare` : ""}
          </span>
        ) : (
          `${covered} / ${required} covered · ${required - covered} remaining`
        )}
      </p>
    </div>
  );
}
