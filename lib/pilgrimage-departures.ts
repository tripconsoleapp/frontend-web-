/** A pre-arranged, already-published pilgrimage group departure. Unlike
 *  "Start from Scratch" or "Use a Template", joining a departure is NOT
 *  trip-building — dates, route, transport, stay and meals are already
 *  fixed by TripConsole, and the participant is only reserving seats and
 *  paying. Content-wise this is its own small dataset (real dates/
 *  capacity), but it deliberately points at an existing template
 *  (`templateId`) for the route/services/itinerary rather than
 *  duplicating that data. */
export type DepartureStatus = "open" | "almost_full" | "full" | "closed" | "cancelled" | "completed";

export interface PilgrimageDeparture {
  id: string;
  templateId: string;
  title: string;
  meetingPoint: string;
  departureDate: string;
  returnDate: string;
  capacity: number;
  /** Seats already booked by other participants before this session —
   *  the mock data's starting fill level. Seats a participant reserves
   *  in THIS session are tracked separately (see pilgrimage-booking.ts)
   *  and added on top, so availability is always derived, never a second
   *  hardcoded number. */
  bookedCount: number;
  pricePerPerson: number;
  /** Set only for departures that are no longer bookable regardless of
   *  remaining capacity (e.g. weather cancellation) — distinct from
   *  simply being full. */
  cancelled?: boolean;
  /** Set once the departure date has passed. */
  completed?: boolean;
}

export const PILGRIMAGE_DEPARTURES: PilgrimageDeparture[] = [
  {
    id: "sabarimala-nov-15",
    templateId: "sabarimala-pilgrimage",
    title: "Sabarimala Group Departure",
    meetingPoint: "Kochi",
    departureDate: "2026-11-15",
    returnDate: "2026-11-16",
    capacity: 40,
    bookedCount: 28,
    pricePerPerson: 1800,
  },
  {
    id: "guruvayur-dec-02",
    templateId: "guruvayur-district",
    title: "Guruvayur District Departure",
    meetingPoint: "Thrissur",
    departureDate: "2026-12-02",
    returnDate: "2026-12-03",
    capacity: 35,
    bookedCount: 7,
    pricePerPerson: 1400,
  },
  {
    id: "sabarimala-dec-20",
    templateId: "sabarimala-heritage",
    title: "Sabarimala Heritage Departure",
    meetingPoint: "Kottayam",
    departureDate: "2026-12-20",
    returnDate: "2026-12-21",
    capacity: 30,
    bookedCount: 26,
    pricePerPerson: 1600,
  },
];

export function getPilgrimageDeparture(id: string) {
  return PILGRIMAGE_DEPARTURES.find((d) => d.id === id);
}

/** Almost-full kicks in once fewer than this fraction of capacity
 *  remains — one named threshold rather than a magic number inline
 *  wherever status is computed. */
const ALMOST_FULL_THRESHOLD = 0.15;

/** The single source of truth for a departure's bookable state. Always
 *  computed from `capacity`/`bookedCount` (plus any seats reserved in
 *  this session, passed in as `additionalBooked`) — never a separately
 *  stored flag that could drift out of sync. */
export function departureStatus(departure: PilgrimageDeparture, additionalBooked = 0): DepartureStatus {
  if (departure.cancelled) return "cancelled";
  if (departure.completed || new Date(departure.returnDate) < new Date()) return "completed";
  const remaining = departure.capacity - departure.bookedCount - additionalBooked;
  if (remaining <= 0) return "full";
  if (remaining / departure.capacity <= ALMOST_FULL_THRESHOLD) return "almost_full";
  return "open";
}

export function remainingSlots(departure: PilgrimageDeparture, additionalBooked = 0): number {
  return Math.max(0, departure.capacity - departure.bookedCount - additionalBooked);
}

export function isDepartureBookable(status: DepartureStatus): boolean {
  return status === "open" || status === "almost_full";
}
