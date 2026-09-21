import {
  DestinationStopSummary,
  GuestMealResponse,
  MealInstance,
  MealMenuSelection,
  MealType,
} from "./listing-draft";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];
export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export interface TripDay {
  dayIndex: number;
  destinationId: string;
  destinationName: string;
}

/** Expands the real overnight stops into one entry per day — a 2-night stop
 *  at Munnar becomes Day 1 and Day 2, both "Munnar". Never invents days
 *  beyond what the actual route calls for. */
export function computeTripDays(stops: DestinationStopSummary[]): TripDay[] {
  const days: TripDay[] = [];
  let dayIndex = 1;
  for (const stop of stops) {
    for (let n = 0; n < stop.nights; n++) {
      days.push({ dayIndex, destinationId: stop.id, destinationName: stop.name });
      dayIndex++;
    }
  }
  return days;
}

/** Merges the real trip days with whatever meal decisions already exist.
 *  A meal keeps its status/restaurant/selections across reroutes; a day
 *  that no longer exists is dropped; a new day starts "pending" for all
 *  three meal slots. Mirrors the hotel flow's `reconcileStays`. */
export function reconcileMeals(
  existingMeals: MealInstance[],
  days: TripDay[],
  participantCount: number
): MealInstance[] {
  const next: MealInstance[] = [];
  for (const day of days) {
    for (const mealType of MEAL_TYPES) {
      const existing = existingMeals.find(
        (m) => m.dayIndex === day.dayIndex && m.mealType === mealType
      );
      if (existing) {
        next.push({ ...existing, destinationName: day.destinationName, destinationId: day.destinationId });
      } else {
        next.push({
          dayIndex: day.dayIndex,
          destinationId: day.destinationId,
          destinationName: day.destinationName,
          mealType,
          status: "pending",
          restaurant: null,
          planningMode: null,
          selections: [],
          responses: [],
          shareToken: null,
          participantCount,
          total: 0,
        });
      }
    }
  }
  return next;
}

export function mealKey(dayIndex: number, mealType: MealType) {
  return `${dayIndex}-${mealType}`;
}

export function parseMealKey(key: string): { dayIndex: number; mealType: MealType } {
  const [dayPart, mealPart] = key.split("-");
  return { dayIndex: Number(dayPart), mealType: mealPart as MealType };
}

export function selectionsTotal(selections: MealMenuSelection[]) {
  return selections.reduce((sum, s) => sum + s.price * s.quantity, 0);
}

/** Turns individual guest responses into the same `selections` shape a
 *  manual plan produces — one line per distinct dish, quantity = how many
 *  guests chose it. Keeps both planning modes producing the same order
 *  object, as required by the spec. */
export function aggregateResponses(responses: GuestMealResponse[]): MealMenuSelection[] {
  const map = new Map<string, MealMenuSelection>();
  for (const r of responses) {
    const addLine = (itemId: string, itemName: string, price: number) => {
      const existing = map.get(itemId);
      if (existing) existing.quantity += 1;
      else map.set(itemId, { itemId, itemName, price, quantity: 1 });
    };
    addLine(r.mainItemId, r.mainItemName, r.mainPrice);
    if (r.extraItemId && r.extraItemName && r.extraPrice !== undefined) {
      addLine(r.extraItemId, r.extraItemName, r.extraPrice);
    }
  }
  return Array.from(map.values());
}

export function mealCounts(meals: MealInstance[]) {
  return {
    confirmed: meals.filter((m) => m.status === "confirmed").length,
    skipped: meals.filter((m) => m.status === "skipped").length,
    remaining: meals.filter((m) => m.status !== "confirmed" && m.status !== "skipped").length,
    total: meals.length,
  };
}

export function mealPlanTotal(meals: MealInstance[]) {
  return meals.reduce((sum, m) => sum + (m.status === "confirmed" ? m.total : 0), 0);
}

export function fitsGroup(capacity: number, participantCount: number) {
  return capacity >= participantCount;
}

export function generateToken() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function generateGuestId() {
  return `g_${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------
// Guest share layer — localStorage, not sessionStorage, because a guest
// opening the link is a different browser tab (possibly a different
// device on the same machine). sessionStorage is per-tab and would never
// be visible to that tab; localStorage is shared across tabs of the same
// origin, so this actually works today. True cross-device sharing (a
// guest on their own phone) would need a real backend — out of scope for
// this project's client-only persistence model.
// ---------------------------------------------------------------------

const SHARE_PREFIX = "tripconsole:meal-share:";
const RESPONSES_PREFIX = "tripconsole:meal-responses:";

export interface SharedMealMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  diet: "veg" | "non-veg" | "vegan" | "jain";
}

export interface SharedMealCategory {
  id: string;
  name: string;
  items: SharedMealMenuItem[];
}

export interface SharedMealSnapshot {
  token: string;
  tripName: string;
  destinationName: string;
  dayIndex: number;
  mealType: MealType;
  restaurantName: string;
  participantCount: number;
  categories: SharedMealCategory[];
}

export function saveSharedMeal(snapshot: SharedMealSnapshot) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SHARE_PREFIX + snapshot.token, JSON.stringify(snapshot));
  } catch {
    // localStorage unavailable — the share link simply won't resolve.
  }
}

export function getSharedMeal(token: string): SharedMealSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHARE_PREFIX + token);
    return raw ? (JSON.parse(raw) as SharedMealSnapshot) : null;
  } catch {
    return null;
  }
}

export function getGuestResponses(token: string): GuestMealResponse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RESPONSES_PREFIX + token);
    return raw ? (JSON.parse(raw) as GuestMealResponse[]) : [];
  } catch {
    return [];
  }
}

export function addGuestResponse(token: string, response: GuestMealResponse) {
  if (typeof window === "undefined") return;
  try {
    const current = getGuestResponses(token).filter((r) => r.guestName !== response.guestName);
    window.localStorage.setItem(RESPONSES_PREFIX + token, JSON.stringify([...current, response]));
  } catch {
    // localStorage unavailable — response just won't be recorded.
  }
}
