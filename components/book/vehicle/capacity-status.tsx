"use client";

import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

export function CapacityStatus({ combined, required }: { combined: number; required: number }) {
  const sufficient = combined >= required;
  const shortfall = Math.max(0, required - combined);

  return (
    <div className={cn("flex flex-col gap-1.5 rounded-xl px-4 py-3", sufficient ? "bg-mint/20" : "bg-destructive-soft")}>
      <div className="flex items-center justify-between font-body text-sm text-navy">
        <span className="text-text-grey">Required passengers</span>
        <span className="font-semibold">{required}</span>
      </div>
      <div className="flex items-center justify-between font-body text-sm text-navy">
        <span className="text-text-grey">Selected capacity</span>
        <span className="font-semibold">{combined}</span>
      </div>
      {sufficient ? (
        <p className="flex items-center gap-1.5 font-body text-xs font-semibold text-navy">
          <Check size={14} /> Sufficient capacity
        </p>
      ) : (
        <p className="flex items-center gap-1.5 font-body text-xs font-semibold text-destructive">
          <AlertTriangle size={14} /> Short by {shortfall} seat{shortfall === 1 ? "" : "s"} — add another vehicle
        </p>
      )}
    </div>
  );
}
