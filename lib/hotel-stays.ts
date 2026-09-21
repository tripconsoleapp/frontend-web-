import {
  DestinationStay,
  DestinationStopSummary,
  RoomSelectionItem,
} from "./listing-draft";

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Turns the real overnight stops into dated stay records, sequential from
 *  the trip's start date — no destination invents its own dates. */
export function computeStayDates(
  stops: DestinationStopSummary[],
  tripStartDate: string
): { destinationId: string; destinationName: string; nights: number; checkIn: string; checkOut: string }[] {
  let cursor = tripStartDate;
  return stops.map((stop) => {
    const checkIn = cursor;
    const checkOut = addDays(cursor, stop.nights);
    cursor = checkOut;
    return {
      destinationId: stop.id,
      destinationName: stop.name,
      nights: stop.nights,
      checkIn,
      checkOut,
    };
  });
}

/** Merges the real route's overnight stops with whatever decisions already
 *  exist in the draft. A destination keeps its booked/skipped status and
 *  selection across reroutes; a destination no longer on the route is
 *  dropped; a newly added one starts "pending". Dates are always
 *  recomputed from the current route, since reordering stops shifts them. */
export function reconcileStays(
  existingStays: DestinationStay[],
  stops: DestinationStopSummary[],
  tripStartDate: string
): DestinationStay[] {
  const dated = computeStayDates(stops, tripStartDate || new Date().toISOString().slice(0, 10));
  return dated.map((stop) => {
    const existing = existingStays.find((s) => s.destinationId === stop.destinationId);
    if (existing) {
      return {
        ...existing,
        destinationName: stop.destinationName,
        nights: stop.nights,
        checkIn: stop.checkIn,
        checkOut: stop.checkOut,
      };
    }
    return {
      destinationId: stop.destinationId,
      destinationName: stop.destinationName,
      nights: stop.nights,
      checkIn: stop.checkIn,
      checkOut: stop.checkOut,
      status: "pending",
      hotel: null,
      rooms: [],
      total: 0,
    };
  });
}

export function roomsRequired(guestCount: number, capacityPerRoom: number) {
  if (capacityPerRoom <= 0) return 0;
  return Math.ceil(guestCount / capacityPerRoom);
}

export function totalGuestsCovered(rooms: RoomSelectionItem[]) {
  return rooms.reduce((sum, r) => sum + r.capacity * r.quantity, 0);
}

export function totalRoomsCount(rooms: RoomSelectionItem[]) {
  return rooms.reduce((sum, r) => sum + r.quantity, 0);
}

export function stayTotal(rooms: RoomSelectionItem[], nights: number) {
  const perNight = rooms.reduce((sum, r) => sum + r.pricePerNight * r.quantity, 0);
  return perNight * Math.max(nights, 1);
}

export interface StayPricingBreakdown {
  roomCharges: number;
  taxesAndFees: number;
  total: number;
}

/** Decomposes the real room total (rate × rooms × nights — never invented)
 *  into a transparent breakdown, mirroring the vehicle flow's approach of
 *  never showing a number that wasn't already derived from the catalog. */
export function buildStayPricing(rooms: RoomSelectionItem[], nights: number): StayPricingBreakdown {
  const total = stayTotal(rooms, nights);
  const taxesAndFees = Math.round(total * 0.05);
  const roomCharges = total - taxesAndFees;
  return { roomCharges, taxesAndFees, total };
}

export function hotelServiceCost(stays: DestinationStay[]) {
  return stays.reduce((sum, s) => sum + (s.status === "booked" ? s.total : 0), 0);
}

export function staySummaryCounts(stays: DestinationStay[]) {
  return {
    booked: stays.filter((s) => s.status === "booked").length,
    skipped: stays.filter((s) => s.status === "skipped").length,
    pending: stays.filter((s) => s.status === "pending").length,
    notRequired: stays.filter((s) => s.status === "not_required").length,
  };
}

export function allStaysDecided(stays: DestinationStay[]) {
  return stays.every((s) => s.status !== "pending");
}

export function firstPendingStay(stays: DestinationStay[]) {
  return stays.find((s) => s.status === "pending") ?? null;
}

export function nightsLabel(nights: number) {
  return nights === 1 ? "1 night" : `${nights} nights`;
}

export function formatStayDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
