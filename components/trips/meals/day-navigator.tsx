"use client";

import { cn } from "@/lib/cn";
import { TripDay } from "@/lib/meal-plan";

export function DayNavigator({
  days,
  activeDay,
  onSelect,
}: {
  days: TripDay[];
  activeDay: number;
  onSelect: (dayIndex: number) => void;
}) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {days.map((day) => {
        const isActive = day.dayIndex === activeDay;
        return (
          <button
            key={day.dayIndex}
            type="button"
            onClick={() => onSelect(day.dayIndex)}
            className={cn(
              "flex shrink-0 flex-col items-start gap-0.5 rounded-xl border px-4 py-2.5 text-left transition-all duration-200",
              isActive
                ? "border-orange bg-orange/10"
                : "border-navy/10 bg-white hover:border-navy/25"
            )}
          >
            <span className={cn("font-body text-sm font-semibold", isActive ? "text-orange" : "text-navy")}>
              Day {day.dayIndex}
            </span>
            <span className="font-body text-xs text-text-grey">{day.destinationName}</span>
          </button>
        );
      })}
    </div>
  );
}
