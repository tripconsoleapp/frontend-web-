"use client";

import Image from "next/image";
import { Star, Users, Briefcase, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import type { PrivateVehicleResult } from "@/lib/vehicle-booking-api";

export function VehicleCard({
  result,
  selected,
  onToggle,
  onViewDetails,
}: {
  result: PrivateVehicleResult;
  selected: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
}) {
  const { vehicle, distanceKm, estimatedPrice } = result;

  return (
    <div className={cn("flex w-full flex-col overflow-hidden rounded-2xl border bg-white transition-shadow hover:shadow-lg sm:flex-row", selected ? "border-orange" : "border-navy/10")}>
      <button type="button" onClick={onViewDetails} className="relative h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-48">
        <Image src={vehicle.image} alt="" fill sizes="(min-width: 640px) 192px, 100vw" className="object-cover" />
        {vehicle.cancellation === "free" && (
          <span className="absolute left-3 top-3">
            <Badge variant="mint">Free cancellation</Badge>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <button type="button" onClick={onViewDetails} className="text-left">
          <p className="font-heading text-base font-semibold text-navy">{vehicle.name}</p>
          <p className="font-body text-xs text-text-grey">{vehicle.operatorName}</p>
        </button>

        <div className="flex flex-wrap items-center gap-3 font-body text-xs text-text-grey">
          <span className="flex items-center gap-1">
            <Users size={13} /> {vehicle.seatingCapacity} seats
          </span>
          <span className="flex items-center gap-1">
            <Briefcase size={13} /> {vehicle.luggageCapacity}
          </span>
          {vehicle.ac && <span>AC</span>}
          <span className="flex items-center gap-1 rounded-md bg-navy/5 px-2 py-0.5">
            <Star size={11} className="fill-orange text-orange" /> {vehicle.rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="font-body text-xs text-text-grey">~{distanceKm} km</p>
            <p className="font-body text-sm text-navy">
              <span className="font-semibold">{formatCurrency(estimatedPrice)}</span> estimated
            </p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-2 font-body text-xs font-semibold transition-colors",
              selected ? "bg-navy text-white" : "bg-orange text-white hover:bg-orange/90"
            )}
          >
            {selected ? (
              <>
                <Check size={13} /> Added
              </>
            ) : (
              "Add Vehicle"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
