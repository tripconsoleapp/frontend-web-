/**
 * KSRTC Scheduled Ticket booking — MOCK catalog (frontend-only).
 *
 * Deliberately separate from lib/vehicle-booking-data.ts's MOCK_KSRTC_SERVICES
 * (which models *chartering* a whole KSRTC bus for a trip group) and from
 * lib/transport-eligibility.ts (the 20-passenger charter-eligibility rule —
 * never imported here). This file models buying individual *seats* on a
 * regular scheduled KSRTC service, the way redBus does — available to
 * anyone, any group size, with no eligibility gate.
 *
 * Services, seat maps and boarding points are generated deterministically
 * from the route + date (same inputs always produce the same demo data)
 * rather than hand-authored per route, so every station pair in
 * KSRTC_STATIONS returns a plausible result. Swap the functions in
 * lib/ksrtc-ticket-api.ts for real API calls later — nothing outside this
 * pair of files should ever import from here directly.
 */

export interface KsrtcStation {
  id: string;
  name: string;
  region: string;
  x: number;
  y: number;
}

export const KSRTC_STATIONS: KsrtcStation[] = [
  { id: "thiruvananthapuram", name: "Thiruvananthapuram", region: "Kerala", x: 2, y: 0 },
  { id: "varkala", name: "Varkala", region: "Kerala", x: 2, y: 1 },
  { id: "kollam", name: "Kollam", region: "Kerala", x: 2, y: 2 },
  { id: "pamba", name: "Pamba (Sabarimala)", region: "Kerala", x: 3.2, y: 2.4 },
  { id: "alappuzha", name: "Alappuzha", region: "Kerala", x: 1, y: 3 },
  { id: "kottayam", name: "Kottayam", region: "Kerala", x: 2.5, y: 3.4 },
  { id: "kochi", name: "Kochi (Ernakulam)", region: "Kerala", x: 2, y: 4 },
  { id: "munnar", name: "Munnar", region: "Kerala", x: 4, y: 4 },
  { id: "thrissur", name: "Thrissur", region: "Kerala", x: 1.4, y: 5.4 },
  { id: "guruvayur", name: "Guruvayur", region: "Kerala", x: 1, y: 5.7 },
  { id: "palakkad", name: "Palakkad", region: "Kerala", x: 3, y: 6 },
  { id: "kozhikode", name: "Kozhikode", region: "Kerala", x: 0, y: 7 },
  { id: "wayanad", name: "Wayanad (Kalpetta)", region: "Kerala", x: 0.6, y: 8 },
  { id: "kannur", name: "Kannur", region: "Kerala", x: -0.4, y: 8.6 },
];

export function getStationById(id: string): KsrtcStation | null {
  return KSRTC_STATIONS.find((s) => s.id === id) ?? null;
}

export function findStationByName(name: string): KsrtcStation | null {
  const needle = name.trim().toLowerCase();
  if (!needle) return null;
  return (
    KSRTC_STATIONS.find((s) => s.name.toLowerCase() === needle) ??
    KSRTC_STATIONS.find((s) => s.name.toLowerCase().includes(needle) || needle.includes(s.name.toLowerCase())) ??
    null
  );
}

const KM_PER_UNIT = 48;
const MIN_DISTANCE_KM = 22;

export function computeStationDistanceKm(fromId: string, toId: string): number {
  const a = getStationById(fromId);
  const b = getStationById(toId);
  if (!a || !b || fromId === toId) return MIN_DISTANCE_KM;
  const raw = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) * KM_PER_UNIT;
  return Math.max(MIN_DISTANCE_KM, Math.round(raw));
}

// ─────────────────────────────────────────────────────────────
// Deterministic pseudo-randomness — same route + date always
// produces the same services/seat map, with no shared/global state.
// ─────────────────────────────────────────────────────────────

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type KsrtcBusType = "garuda-volvo-ac" | "super-fast" | "super-deluxe" | "fast-passenger" | "ordinary";

export const BUS_TYPE_LABELS: Record<KsrtcBusType, string> = {
  "garuda-volvo-ac": "Garuda Maharaja (AC Volvo)",
  "super-fast": "Super Fast",
  "super-deluxe": "Super Deluxe",
  "fast-passenger": "Fast Passenger",
  ordinary: "Ordinary",
};

const BUS_TYPE_PROFILE: Record<KsrtcBusType, { fareRatePerKm: number; speedKmph: number; seatCols: 4; seatRows: number; amenities: string[] }> = {
  "garuda-volvo-ac": { fareRatePerKm: 2.3, speedKmph: 58, seatCols: 4, seatRows: 10, amenities: ["AC", "Pushback Seats", "Charging Point", "Blanket", "Water Bottle"] },
  "super-fast": { fareRatePerKm: 1.1, speedKmph: 48, seatCols: 4, seatRows: 12, amenities: ["Pushback Seats", "Music System"] },
  "super-deluxe": { fareRatePerKm: 1.4, speedKmph: 46, seatCols: 4, seatRows: 11, amenities: ["Pushback Seats", "Limited Stops"] },
  "fast-passenger": { fareRatePerKm: 0.78, speedKmph: 38, seatCols: 4, seatRows: 13, amenities: ["Standard Seats"] },
  ordinary: { fareRatePerKm: 0.55, speedKmph: 32, seatCols: 4, seatRows: 13, amenities: ["Standard Seats", "Frequent Stops"] },
};

const BUS_TYPE_ORDER: KsrtcBusType[] = ["garuda-volvo-ac", "super-fast", "super-deluxe", "fast-passenger", "ordinary"];

export const CANCELLATION_POLICY = [
  "Free cancellation up to 4 hours before departure (reservation fee and GST are non-refundable).",
  "50% refund if cancelled between 4 hours and 1 hour before departure.",
  "No refund within 1 hour of departure, or after the bus has departed.",
  "Approved refunds are credited to your TripConsole Wallet, not your original payment method.",
];

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutes + 1440) % 1440;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function minutesBetween(start: string, durationMin: number): string {
  return addMinutes(start, durationMin);
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export interface KsrtcWaypoint {
  id: string;
  name: string;
  time: string;
}

export interface KsrtcScheduledService {
  id: string;
  fromStationId: string;
  toStationId: string;
  busType: KsrtcBusType;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  durationMinutes: number;
  journeyDate: string;
  fare: number;
  totalSeats: number;
  availableSeats: number;
  rating: number;
  amenities: string[];
  boardingPoints: KsrtcWaypoint[];
  droppingPoints: KsrtcWaypoint[];
}

/** Same seed formula generateSeatLayout() uses for its per-seat "booked"
 *  roll, so a service's advertised availableSeats count always matches
 *  the seat map it leads to. */
function seatBookedRatio(serviceId: string): number {
  const rng = mulberry32(hashString(`${serviceId}|seats`));
  return 0.25 + rng() * 0.45;
}

function buildWaypoints(stationName: string, baseTime: string, offsets: number[], suffixes: string[]): KsrtcWaypoint[] {
  return offsets.map((offset, i) => ({
    id: `${stationName}-${i}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: `${stationName} ${suffixes[i]}`,
    time: addMinutes(baseTime, offset),
  }));
}

/** Generates the day's scheduled services for a route. Returns [] for a
 *  same-station "route" (nothing to search) and for any route pair that
 *  isn't a real connection in this mock model (handled by the caller). */
export function generateServicesForRoute(fromId: string, toId: string, journeyDate: string): KsrtcScheduledService[] {
  if (!fromId || !toId || fromId === toId) return [];
  const from = getStationById(fromId);
  const to = getStationById(toId);
  if (!from || !to) return [];

  const distanceKm = computeStationDistanceKm(fromId, toId);
  const seed = hashString(`${fromId}|${toId}|${journeyDate}`);
  const rng = mulberry32(seed);

  const serviceCount = 4 + Math.floor(rng() * 3); // 4–6 services/day
  const usedTypes = [...BUS_TYPE_ORDER].sort(() => rng() - 0.5).slice(0, serviceCount);
  // Pad out if serviceCount > BUS_TYPE_ORDER.length (never happens at 6 max, but keeps this safe).
  while (usedTypes.length < serviceCount) usedTypes.push(BUS_TYPE_ORDER[Math.floor(rng() * BUS_TYPE_ORDER.length)]);

  const departureBaseMinutes = 300 + Math.floor(rng() * 60); // first departure 05:00–06:00
  const services: KsrtcScheduledService[] = usedTypes
    .map((busType, index) => {
      const profile = BUS_TYPE_PROFILE[busType];
      const departureMinutes = (departureBaseMinutes + index * (120 + Math.floor(rng() * 90))) % 1440;
      const departureTime = `${String(Math.floor(departureMinutes / 60)).padStart(2, "0")}:${String(departureMinutes % 60).padStart(2, "0")}`;
      const durationMinutes = Math.max(45, Math.round((distanceKm / profile.speedKmph) * 60));
      const arrivalTime = minutesBetween(departureTime, durationMinutes);
      const fare = Math.max(40, Math.round((profile.fareRatePerKm * distanceKm) / 5) * 5);
      const totalSeats = profile.seatRows * profile.seatCols;
      const rating = Math.round((3.6 + rng() * 1.3) * 10) / 10;

      // "::" (not "-") separates fields — journeyDate ("2026-11-01") and
      // busType ("super-fast") both contain hyphens, which would make a
      // hyphen-delimited id ambiguous to split back apart in getServiceById.
      const id = `ksrtc::${fromId}::${toId}::${journeyDate}::${busType}::${index}`;

      return {
        id,
        fromStationId: fromId,
        toStationId: toId,
        busType,
        departureTime,
        arrivalTime,
        durationLabel: formatDuration(durationMinutes),
        durationMinutes,
        journeyDate,
        fare,
        totalSeats,
        availableSeats: Math.max(0, totalSeats - Math.round(totalSeats * seatBookedRatio(id))),
        rating,
        amenities: profile.amenities,
        boardingPoints: buildWaypoints(from.name, departureTime, [-20, -10, 0], ["Private Stand", "Railway Station", "KSRTC Bus Stand"]),
        droppingPoints: buildWaypoints(to.name, arrivalTime, [0, 10, 20], ["KSRTC Bus Stand", "Town Junction", "Private Stand"]),
      };
    })
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime));

  return services;
}

export function getServiceById(serviceId: string): KsrtcScheduledService | null {
  const parts = serviceId.split("::");
  if (parts[0] !== "ksrtc" || parts.length !== 6) return null;
  const [, fromStationId, toStationId, journeyDate] = parts;
  const services = generateServicesForRoute(fromStationId, toStationId, journeyDate);
  return services.find((s) => s.id === serviceId) ?? null;
}

// ─────────────────────────────────────────────────────────────
// Seat layout
// ─────────────────────────────────────────────────────────────

export type SeatCategory = "general" | "ladies";

export interface KsrtcSeat {
  id: string;
  label: string;
  row: number;
  col: number;
  category: SeatCategory;
  booked: boolean;
}

export interface KsrtcSeatLayout {
  rows: number;
  cols: 4;
  seats: KsrtcSeat[];
}

const COL_LABELS = ["A", "B", "C", "D"];

export function generateSeatLayout(service: KsrtcScheduledService): KsrtcSeatLayout {
  const profile = BUS_TYPE_PROFILE[service.busType];
  const rng = mulberry32(hashString(`${service.id}|seats`));
  const bookedRatio = seatBookedRatio(service.id); // 25–70% pre-booked, so results always show mixed availability

  const seats: KsrtcSeat[] = [];
  for (let row = 1; row <= profile.seatRows; row++) {
    for (let col = 0; col < profile.seatCols; col++) {
      const label = `${row}${COL_LABELS[col]}`;
      seats.push({
        id: `${service.id}-${label}`,
        label,
        row,
        col,
        category: row === 1 && col < 2 ? "ladies" : "general",
        booked: rng() < bookedRatio,
      });
    }
  }
  return { rows: profile.seatRows, cols: 4, seats };
}

// ─────────────────────────────────────────────────────────────
// Fare breakdown — one shared shape for the Seats, Review and
// Ticket-detail screens so they never disagree on a total.
// ─────────────────────────────────────────────────────────────

const RESERVATION_FEE_PER_SEAT = 15;
const GST_RATE = 0.05;

export interface KsrtcFareBreakdown {
  farePerSeat: number;
  seatCount: number;
  baseFare: number;
  reservationFee: number;
  gst: number;
  totalAmount: number;
}

export function calculateFare(farePerSeat: number, seatCount: number): KsrtcFareBreakdown {
  const baseFare = farePerSeat * seatCount;
  const reservationFee = RESERVATION_FEE_PER_SEAT * seatCount;
  const gst = Math.round((baseFare + reservationFee) * GST_RATE);
  return { farePerSeat, seatCount, baseFare, reservationFee, gst, totalAmount: baseFare + reservationFee + gst };
}

/** Refund for a cancellation, per CANCELLATION_POLICY: full fare+fees+GST
 *  minus the fee/GST (non-refundable) at 4h+, half of that at 1–4h, zero
 *  inside 1 hour or after departure. */
export function calculateRefund(fare: KsrtcFareBreakdown, hoursBeforeDeparture: number): number {
  if (hoursBeforeDeparture >= 4) return fare.baseFare;
  if (hoursBeforeDeparture >= 1) return Math.round(fare.baseFare * 0.5);
  return 0;
}
