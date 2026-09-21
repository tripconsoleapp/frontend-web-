import {
  DestinationActivityPlan,
  DestinationStopSummary,
  MealInstance,
  ScheduledActivity,
} from "./listing-draft";
import { MEAL_LABELS } from "./meal-plan";

/** Merges the real route's destinations with whatever activity decisions
 *  already exist. A destination keeps its status/activities across
 *  reroutes; one no longer on the route is dropped; a new one starts
 *  "not_planned" (never "skipped" — those are different states). Mirrors
 *  the hotel flow's `reconcileStays`. */
export function reconcileActivityDestinations(
  existing: DestinationActivityPlan[],
  stops: DestinationStopSummary[]
): DestinationActivityPlan[] {
  return stops.map((stop) => {
    const found = existing.find((d) => d.destinationId === stop.id);
    if (found) return { ...found, destinationName: stop.name };
    return { destinationId: stop.id, destinationName: stop.name, status: "not_planned", activities: [] };
  });
}

export function destinationTotal(activities: ScheduledActivity[]) {
  return activities.reduce((sum, a) => sum + a.total, 0);
}

export function planTotal(destinations: DestinationActivityPlan[]) {
  return destinations.reduce(
    (sum, d) => sum + (d.status === "has_activities" ? destinationTotal(d.activities) : 0),
    0
  );
}

export function activityCounts(destinations: DestinationActivityPlan[]) {
  return {
    configured: destinations.filter((d) => d.status === "has_activities").length,
    skipped: destinations.filter((d) => d.status === "skipped").length,
    notPlanned: destinations.filter((d) => d.status === "not_planned").length,
  };
}

export function fitsGroup(capacity: number, participantCount: number) {
  return capacity >= participantCount;
}

export function generateScheduledActivityId() {
  return `sa_${Math.random().toString(36).slice(2, 10)}`;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function addDaysIso(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** One entry per individual trip day (a 2-night stop produces 2 entries) —
 *  the same day numbering the meal-planning flow uses, so activities and
 *  meals refer to the same "Day N". */
export function computeDestinationDayDates(
  stops: DestinationStopSummary[],
  tripStartDate: string
): { dayIndex: number; destinationId: string; date: string }[] {
  const out: { dayIndex: number; destinationId: string; date: string }[] = [];
  let cursor = tripStartDate;
  let dayIndex = 1;
  for (const stop of stops) {
    for (let n = 0; n < stop.nights; n++) {
      out.push({ dayIndex, destinationId: stop.id, date: cursor });
      cursor = addDaysIso(cursor, 1);
      dayIndex++;
    }
  }
  return out;
}

export interface ScheduleConflict {
  type: "activity" | "meal";
  label: string;
}

/** Checks a candidate activity's date/time against other activities already
 *  in the same destination and against confirmed meals on the same trip
 *  day. Meal exact times aren't tracked (only day + breakfast/lunch/dinner),
 *  so a representative serving window is used per meal type — a documented
 *  approximation, not a fabricated precise time. Transport isn't checked:
 *  this app books one vehicle for the whole trip with no per-day time
 *  slots, so there is no real transport timing data to conflict against. */
export const MEAL_WINDOWS: Record<string, [string, string]> = {
  breakfast: ["07:00", "09:00"],
  lunch: ["12:30", "14:00"],
  dinner: ["19:00", "21:00"],
};

export function findScheduleConflicts(
  candidate: { date: string; startTime: string; endTime: string },
  existingActivities: ScheduledActivity[],
  excludeId: string | null,
  meals: MealInstance[],
  stops: DestinationStopSummary[],
  tripStartDate: string
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const start = toMinutes(candidate.startTime);
  const end = toMinutes(candidate.endTime);

  for (const a of existingActivities) {
    if (a.id === excludeId || a.date !== candidate.date) continue;
    const aStart = toMinutes(a.startTime);
    const aEnd = toMinutes(a.endTime);
    if (start < aEnd && aStart < end) {
      conflicts.push({ type: "activity", label: `${a.name} (${a.startTime}–${a.endTime})` });
    }
  }

  const dayDates = computeDestinationDayDates(stops, tripStartDate);
  const matchingDay = dayDates.find((d) => d.date === candidate.date);
  if (matchingDay) {
    for (const meal of meals) {
      if (meal.status !== "confirmed" || meal.dayIndex !== matchingDay.dayIndex) continue;
      const [mStart, mEnd] = MEAL_WINDOWS[meal.mealType];
      const mStartMin = toMinutes(mStart);
      const mEndMin = toMinutes(mEnd);
      if (start < mEndMin && mStartMin < end) {
        conflicts.push({
          type: "meal",
          label: `${MEAL_LABELS[meal.mealType]} at ${meal.restaurant?.name ?? "your planned restaurant"} (${mStart}–${mEnd})`,
        });
      }
    }
  }

  return conflicts;
}
