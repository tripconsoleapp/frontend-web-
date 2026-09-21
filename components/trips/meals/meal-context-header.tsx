"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, UtensilsCrossed, Users } from "lucide-react";
import { useTripContext } from "@/lib/use-trip-context";
import { MEAL_LABELS } from "@/lib/meal-plan";
import { MealType } from "@/lib/listing-draft";

export function MealContextHeader({
  backHref,
  backLabel = "Back to Services",
  eyebrow,
  meal,
}: {
  backHref: string;
  backLabel?: string;
  eyebrow: string;
  meal?: { destinationName: string; dayIndex: number; mealType: MealType };
}) {
  const { passengerCount, ready } = useTripContext();

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy"
      >
        <ArrowLeft size={14} /> {backLabel}
      </Link>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
        {eyebrow}
      </p>

      {meal && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-sm text-text-grey">
          <span className="flex items-center gap-1.5 font-semibold text-navy">
            <MapPin size={13} className="text-orange" /> {meal.destinationName}
          </span>
          <span>Day {meal.dayIndex}</span>
          <span className="flex items-center gap-1.5">
            <UtensilsCrossed size={13} /> {MEAL_LABELS[meal.mealType]}
          </span>
          {ready && passengerCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Users size={13} /> {passengerCount} travelers
            </span>
          )}
        </div>
      )}
    </div>
  );
}
