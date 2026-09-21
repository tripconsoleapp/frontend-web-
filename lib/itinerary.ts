import {
  ConflictLevel,
  DestinationStopSummary,
  ItineraryBlock,
  ItineraryConflict,
  ItineraryDay,
  ItineraryDraft,
  ServicesDraft,
} from "./listing-draft";
import { getKeralaLocation, distanceBetween, driveHoursBetween } from "./kerala-locations";
import { computeStayDates } from "./hotel-stays";
import { MEAL_LABELS } from "./meal-plan";
import { MEAL_WINDOWS } from "./activity-plan";

// ---------------------------------------------------------------------
// Time helpers — all times are "HH:MM" 24h strings for one calendar date.
// ---------------------------------------------------------------------

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(total: number) {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.round(total)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function addDaysIso(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateBlockId() {
  return `blk_${Math.random().toString(36).slice(2, 10)}`;
}

/** A "conventional" default start time for a day's first scheduled item
 *  when nothing in the data anchors it — an editable scheduling default,
 *  not a claimed fact (unlike price/distance/rating, which this module
 *  never invents). */
const DEFAULT_DAY_START = "08:00";

export interface TripDayDate {
  dayIndex: number;
  destinationId: string;
  destinationName: string;
  date: string;
}

/** One entry per individual trip day — a 2-night stop produces 2 entries.
 *  The same numbering the meal-planning flow already uses, so "Day 3" means
 *  the same thing everywhere in the app. */
export function computeTripDayDates(stops: DestinationStopSummary[], tripStartDate: string): TripDayDate[] {
  const out: TripDayDate[] = [];
  let cursor = tripStartDate;
  let dayIndex = 1;
  for (const stop of stops) {
    for (let n = 0; n < stop.nights; n++) {
      out.push({ dayIndex, destinationId: stop.id, destinationName: stop.name, date: cursor });
      cursor = addDaysIso(cursor, 1);
      dayIndex++;
    }
  }
  return out;
}

// ---------------------------------------------------------------------
// Conflict validation — re-run after every add/edit/remove/reorder.
// ---------------------------------------------------------------------

const TIMED_TYPES = new Set(["travel", "activity", "meal", "check_in", "check_out", "hidden_gem", "custom"]);

function overlaps(a: ItineraryBlock, b: ItineraryBlock) {
  return toMinutes(a.startTime) < toMinutes(b.endTime) && toMinutes(b.startTime) < toMinutes(a.endTime);
}

export function validateDayConflicts(blocks: ItineraryBlock[]): ItineraryConflict[] {
  const timed = blocks.filter((b) => TIMED_TYPES.has(b.type) && b.type !== "free_time");
  const conflicts: ItineraryConflict[] = [];
  const sorted = [...timed].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      if (overlaps(a, b)) {
        conflicts.push({
          id: `conf_${a.id}_${b.id}`,
          level: "error",
          message: `${a.title} overlaps with ${b.title}.`,
          blockIds: [a.id, b.id],
        });
      }
    }
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (overlaps(a, b)) continue;
    const gap = toMinutes(b.startTime) - toMinutes(a.endTime);
    if (gap > 0 && gap < 30) {
      conflicts.push({
        id: `conf_${a.id}_${b.id}_gap`,
        level: "warning",
        message: `Only ${gap} minutes between ${a.title} and ${b.title}.`,
        blockIds: [a.id, b.id],
      });
    }
  }

  return conflicts;
}

/** Free-time blocks are always derived, never user data — strip any
 *  existing ones and recompute fresh gaps (≥60 min) between the real
 *  scheduled blocks. Keeps free time accurate after every edit instead of
 *  going stale. */
function withFreshFreeTime(blocks: ItineraryBlock[], date: string): ItineraryBlock[] {
  const real = blocks.filter((b) => b.type !== "free_time");
  const timed = real
    .filter((b) => TIMED_TYPES.has(b.type))
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  const stayBlocks = real.filter((b) => b.type === "stay");

  const gaps: ItineraryBlock[] = [];
  for (let i = 0; i < timed.length - 1; i++) {
    const gapStart = toMinutes(timed[i].endTime);
    const gapEnd = toMinutes(timed[i + 1].startTime);
    if (gapEnd - gapStart >= 60) {
      const hours = Math.round(((gapEnd - gapStart) / 60) * 10) / 10;
      gaps.push({
        id: generateBlockId(),
        type: "free_time",
        title: "Free Time",
        subtitle: `${hours} ${hours === 1 ? "hour" : "hours"} available`,
        destinationId: timed[i].destinationId,
        date,
        startTime: fromMinutes(gapStart),
        endTime: fromMinutes(gapEnd),
        locked: false,
      });
    }
  }

  return [...timed, ...gaps, ...stayBlocks];
}

/** The single recompute path for any mutation (add/edit/remove/move) —
 *  refreshes free time and conflicts together so they can never drift
 *  apart from the actual block list. */
export function recomputeDay(day: ItineraryDay): ItineraryDay {
  const blocks = withFreshFreeTime(day.blocks, day.date);
  return { ...day, blocks, conflicts: validateDayConflicts(blocks) };
}

function timedSorted(blocks: ItineraryBlock[]) {
  return blocks
    .filter((b) => TIMED_TYPES.has(b.type) && b.type !== "free_time")
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
}

/** Swaps this block's time slot with its chronological neighbor — a real
 *  reschedule (not just a visual shuffle), so conflict/free-time
 *  recomputation stays meaningful. */
export function moveBlock(day: ItineraryDay, blockId: string, direction: "earlier" | "later"): ItineraryDay {
  const sorted = timedSorted(day.blocks);
  const index = sorted.findIndex((b) => b.id === blockId);
  if (index === -1) return day;
  const neighborIndex = direction === "earlier" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= sorted.length) return day;
  const a = sorted[index];
  const b = sorted[neighborIndex];
  const nextBlocks = day.blocks.map((blk) => {
    if (blk.id === a.id) return { ...blk, startTime: b.startTime, endTime: b.endTime };
    if (blk.id === b.id) return { ...blk, startTime: a.startTime, endTime: a.endTime };
    return blk;
  });
  return recomputeDay({ ...day, blocks: nextBlocks });
}

// ---------------------------------------------------------------------
// Generation — reads the four services + real destination/date data and
// produces a chronological draft. Never invents price/distance/rating;
// only uses conventional, editable default times where no source of
// truth exists for a schedule anchor.
// ---------------------------------------------------------------------

export interface GenerationInput {
  stops: DestinationStopSummary[];
  startDate: string;
  startLocationId: string;
  startLocationName: string;
  services: ServicesDraft;
}

export function generateItinerary(input: GenerationInput): ItineraryDraft {
  const { stops, startDate, startLocationId, startLocationName, services } = input;
  const dayDates = computeTripDayDates(stops, startDate);
  if (dayDates.length === 0) return { status: "not_generated", generatedAt: null, days: [] };

  const hotelStays = services.hotel.stays;
  const meals = services.restaurant.meals;
  const vehicles = services.vehicle.vehicles;
  const vehicleLabel = vehicles.length === 0 ? undefined : vehicles.length === 1 ? vehicles[0].name : `${vehicles.length} vehicles`;

  const days: ItineraryDay[] = dayDates.map((d, idx) => {
    const blocks: ItineraryBlock[] = [];
    const isTransitionDay = idx === 0 || dayDates[idx - 1].destinationId !== d.destinationId;
    let cursor = DEFAULT_DAY_START;

    if (isTransitionDay) {
      const prevDestId = idx === 0 ? null : dayDates[idx - 1].destinationId;

      if (prevDestId) {
        const prevStay = hotelStays.find((s) => s.destinationId === prevDestId && s.status === "booked");
        if (prevStay && prevStay.checkOut === d.date) {
          blocks.push({
            id: generateBlockId(),
            type: "check_out",
            title: "Check-out",
            subtitle: prevStay.hotel?.name,
            destinationId: prevDestId,
            date: d.date,
            startTime: cursor,
            endTime: cursor,
            imageUrl: prevStay.hotel?.imageUrl,
            sourceType: "hotel",
            sourceId: prevDestId,
            locked: true,
          });
        }
      }

      const fromLoc = prevDestId ? getKeralaLocation(prevDestId) : startLocationId ? getKeralaLocation(startLocationId) : undefined;
      const toLoc = getKeralaLocation(d.destinationId);
      if (fromLoc && toLoc && fromLoc.id !== toLoc.id) {
        const km = distanceBetween(fromLoc, toLoc);
        const hours = driveHoursBetween(fromLoc, toLoc);
        const start = cursor;
        const end = fromMinutes(toMinutes(start) + hours * 60);
        blocks.push({
          id: generateBlockId(),
          type: "travel",
          title: prevDestId ? `Transfer to ${toLoc.name}` : `Depart from ${startLocationName || fromLoc.name}`,
          subtitle: [
            `${fromLoc.name} → ${toLoc.name} · ~${km} km`,
            vehicleLabel,
          ]
            .filter(Boolean)
            .join(" · "),
          destinationId: d.destinationId,
          date: d.date,
          startTime: start,
          endTime: end,
          sourceType: "vehicle",
          sourceId: vehicles[0]?.id ?? null,
          locked: true,
        });
        cursor = end;
      }

      const thisStay = hotelStays.find((s) => s.destinationId === d.destinationId && s.status === "booked");
      if (thisStay && thisStay.checkIn === d.date) {
        blocks.push({
          id: generateBlockId(),
          type: "check_in",
          title: "Check-in",
          subtitle: thisStay.hotel?.name,
          destinationId: d.destinationId,
          date: d.date,
          startTime: cursor,
          endTime: cursor,
          imageUrl: thisStay.hotel?.imageUrl,
          sourceType: "hotel",
          sourceId: d.destinationId,
          price: thisStay.total,
          locked: true,
        });
      }
    } else {
      const thisStay = hotelStays.find((s) => s.destinationId === d.destinationId && s.status === "booked");
      if (thisStay) {
        blocks.push({
          id: generateBlockId(),
          type: "stay",
          title: "Staying",
          subtitle: thisStay.hotel?.name,
          destinationId: d.destinationId,
          date: d.date,
          startTime: "23:59",
          endTime: "23:59",
          imageUrl: thisStay.hotel?.imageUrl,
          sourceType: "hotel",
          sourceId: d.destinationId,
          locked: true,
        });
      }
    }

    const destActivities = services.activities.destinations.find((a) => a.destinationId === d.destinationId);
    if (destActivities?.status === "has_activities") {
      for (const activity of destActivities.activities) {
        if (activity.date !== d.date) continue;
        blocks.push({
          id: generateBlockId(),
          type: "activity",
          title: activity.name,
          subtitle: `${activity.durationHours} ${activity.durationHours === 1 ? "hour" : "hours"}`,
          destinationId: d.destinationId,
          date: d.date,
          startTime: activity.startTime,
          endTime: activity.endTime,
          imageUrl: activity.imageUrl,
          sourceType: "activity",
          sourceId: activity.id,
          participants: activity.participants,
          price: activity.total,
          locked: true,
        });
      }
    }

    for (const meal of meals) {
      if (meal.status !== "confirmed" || meal.dayIndex !== d.dayIndex) continue;
      const [start, end] = MEAL_WINDOWS[meal.mealType];
      blocks.push({
        id: generateBlockId(),
        type: "meal",
        title: MEAL_LABELS[meal.mealType],
        subtitle: meal.restaurant?.name,
        destinationId: d.destinationId,
        date: d.date,
        startTime: start,
        endTime: end,
        imageUrl: meal.restaurant?.imageUrl,
        sourceType: "meal",
        sourceId: `${meal.dayIndex}-${meal.mealType}`,
        participants: meal.participantCount,
        price: meal.total,
        locked: true,
      });
    }

    const blocksWithFreeTime = withFreshFreeTime(blocks, d.date);
    return {
      dayIndex: d.dayIndex,
      date: d.date,
      destinationId: d.destinationId,
      destinationName: d.destinationName,
      blocks: blocksWithFreeTime,
      conflicts: validateDayConflicts(blocksWithFreeTime),
    };
  });

  return { status: "draft", generatedAt: new Date().toISOString(), days };
}

export function itineraryHasBlockingErrors(draft: ItineraryDraft) {
  return draft.days.some((d) => d.conflicts.some((c) => c.level === "error"));
}

export function dayPlannedMinutes(day: ItineraryDay) {
  const timed = timedSorted(day.blocks);
  if (timed.length === 0) return 0;
  const start = toMinutes(timed[0].startTime);
  const end = Math.max(...timed.map((b) => toMinutes(b.endTime)));
  return Math.max(0, end - start);
}

export function dayTotalCost(day: ItineraryDay) {
  return day.blocks.reduce((sum, b) => sum + (b.price ?? 0), 0);
}

export function itineraryTotalCost(draft: ItineraryDraft) {
  return draft.days.reduce((sum, d) => sum + dayTotalCost(d), 0);
}

export { toMinutes, fromMinutes };
