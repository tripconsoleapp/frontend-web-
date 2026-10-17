/**
 * Standalone Vehicle Booking — MOCK catalog (frontend-only).
 *
 * Deliberately separate from lib/mock-vehicle-catalog.ts (Trip Builder's
 * transport flow) and from Trip Builder's KSRTC eligibility logic
 * (lib/transport-eligibility.ts, components/trips/transport/
 * ksrtc-eligibility-note.tsx) — neither is imported or referenced
 * anywhere in this standalone flow. The 5 vehicle-type categories below
 * intentionally mirror the names/shape already established in
 * lib/mock-vehicle-catalog.ts's VEHICLE_TYPES (not imported — this is a
 * fresh, independent copy) since that's the existing TripConsole
 * convention for these categories.
 *
 * Distances are computed from rough relative map positions rather than a
 * giant pairwise lookup table, so every pickup/drop combination produces
 * a plausible, deterministic distance for mock pricing. These are NOT
 * real road distances.
 */

export type VehicleCategoryId = "ac-sleeper-bus" | "non-ac-sleeper-bus" | "mini-bus" | "tempo-traveller" | "car";
export type CancellationTerms = "free" | "non_refundable";

export interface VehicleLocation {
  id: string;
  name: string;
  region: string;
  x: number;
  y: number;
}

export interface VehicleCategory {
  id: VehicleCategoryId;
  name: string;
  capacityRange: string;
  idealFor: string;
  fromPrice: number;
  image: string;
}

export interface VehicleListing {
  id: string;
  categoryId: VehicleCategoryId;
  operatorName: string;
  name: string;
  image: string;
  seatingCapacity: number;
  luggageCapacity: string;
  ac: boolean;
  driverIncluded: boolean;
  baseFare: number;
  perKmRate: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  cancellation: CancellationTerms;
  freeCancellationHoursBeforePickup?: number;
}

export const VEHICLE_LOCATIONS: VehicleLocation[] = [
  { id: "kochi", name: "Kochi", region: "Kerala", x: 2, y: 4 },
  { id: "munnar", name: "Munnar", region: "Kerala", x: 4, y: 4 },
  { id: "thekkady", name: "Thekkady", region: "Kerala", x: 4, y: 3 },
  { id: "alappuzha", name: "Alappuzha", region: "Kerala", x: 1, y: 3 },
  { id: "kovalam", name: "Kovalam", region: "Kerala", x: 2, y: 0 },
  { id: "wayanad", name: "Wayanad", region: "Kerala", x: 0, y: 9 },
  { id: "kozhikode", name: "Kozhikode", region: "Kerala", x: 0, y: 7 },
  { id: "trivandrum", name: "Trivandrum", region: "Kerala", x: 2, y: 0.5 },
];

const KM_PER_UNIT = 55;
const MIN_DISTANCE_KM = 25;

export function getLocationById(id: string): VehicleLocation | null {
  return VEHICLE_LOCATIONS.find((l) => l.id === id) ?? null;
}

export function computeDistanceKm(pickupId: string, dropId: string): number {
  if (pickupId === dropId) return MIN_DISTANCE_KM;
  const a = getLocationById(pickupId);
  const b = getLocationById(dropId);
  if (!a || !b) return MIN_DISTANCE_KM;
  const raw = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) * KM_PER_UNIT;
  return Math.max(MIN_DISTANCE_KM, Math.round(raw));
}

const IMG = {
  acSleeper: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80",
  nonAcSleeper: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=80",
  miniBus: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1000&q=80",
  tempo: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?auto=format&fit=crop&w=1000&q=80",
  sedan: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80",
  suv: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80",
  luxurySedan: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80",
};

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  { id: "ac-sleeper-bus", name: "AC Sleeper Bus", capacityRange: "40–52 seats", idealFor: "Best for long-distance, large groups", fromPrice: 25000, image: IMG.acSleeper },
  { id: "non-ac-sleeper-bus", name: "Non-AC Sleeper Bus", capacityRange: "40–50 seats", idealFor: "Budget-friendly for large groups", fromPrice: 18000, image: IMG.nonAcSleeper },
  { id: "mini-bus", name: "Mini Bus", capacityRange: "20–35 seats", idealFor: "Ideal for medium-sized groups", fromPrice: 15000, image: IMG.miniBus },
  { id: "tempo-traveller", name: "Tempo Traveller", capacityRange: "12–17 seats", idealFor: "Ideal for small to mid-size groups", fromPrice: 8500, image: IMG.tempo },
  { id: "car", name: "Car", capacityRange: "4–7 seats", idealFor: "Best for individuals or small families", fromPrice: 2800, image: IMG.sedan },
];

export function getCategoryById(id: string): VehicleCategory | null {
  return VEHICLE_CATEGORIES.find((c) => c.id === id) ?? null;
}

function v(input: Omit<VehicleListing, "luggageCapacity" | "driverIncluded"> & Partial<Pick<VehicleListing, "luggageCapacity" | "driverIncluded">>): VehicleListing {
  return { luggageCapacity: "Roof carrier", driverIncluded: true, ...input };
}

export const MOCK_VEHICLES: VehicleListing[] = [
  // ---------------- AC Sleeper Bus ----------------
  v({
    id: "kt-ac-sleeper-52",
    categoryId: "ac-sleeper-bus",
    operatorName: "Kerala Travels Pvt Ltd",
    name: "Volvo Multi-Axle AC Sleeper (52 Seater)",
    image: IMG.acSleeper,
    seatingCapacity: 52,
    ac: true,
    baseFare: 20000,
    perKmRate: 50,
    rating: 4.8,
    reviewCount: 127,
    amenities: ["AC", "Reclining Seats", "Charging Point", "Blanket"],
    cancellation: "free",
    freeCancellationHoursBeforePickup: 24,
  }),
  v({
    id: "ev-ac-sleeper-45",
    categoryId: "ac-sleeper-bus",
    operatorName: "Everest Travel Solutions",
    name: "AC Sleeper Coach (45 Seater)",
    image: IMG.acSleeper,
    seatingCapacity: 45,
    ac: true,
    baseFare: 17000,
    perKmRate: 46,
    rating: 4.4,
    reviewCount: 64,
    amenities: ["AC", "Reclining Seats", "Charging Point"],
    cancellation: "non_refundable",
  }),
  // ---------------- Non-AC Sleeper Bus ----------------
  v({
    id: "gm-nonac-sleeper-50",
    categoryId: "non-ac-sleeper-bus",
    operatorName: "Green Meadows Transport",
    name: "Non-AC Sleeper Coach (50 Seater)",
    image: IMG.nonAcSleeper,
    seatingCapacity: 50,
    ac: false,
    baseFare: 12000,
    perKmRate: 33,
    rating: 4.1,
    reviewCount: 38,
    amenities: ["Reclining Seats", "Music System"],
    cancellation: "non_refundable",
  }),
  // ---------------- Mini Bus ----------------
  v({
    id: "mini-bus-32",
    categoryId: "mini-bus",
    operatorName: "South Coast Taxis",
    name: "Mini Bus (32 Seater)",
    image: IMG.miniBus,
    seatingCapacity: 32,
    ac: true,
    baseFare: 4200,
    perKmRate: 40,
    rating: 4.3,
    reviewCount: 71,
    amenities: ["AC", "Music System"],
    cancellation: "non_refundable",
  }),
  v({
    id: "mini-bus-25",
    categoryId: "mini-bus",
    operatorName: "South Coast Taxis",
    name: "Mini Bus (25 Seater)",
    image: IMG.miniBus,
    seatingCapacity: 25,
    ac: true,
    baseFare: 3500,
    perKmRate: 35,
    rating: 4.2,
    reviewCount: 61,
    amenities: ["AC", "Music System"],
    cancellation: "non_refundable",
  }),
  // ---------------- Tempo Traveller ----------------
  v({
    id: "tempo-17-seater",
    categoryId: "tempo-traveller",
    operatorName: "Group Travel Kerala",
    name: "Tempo Traveller (17 Seater)",
    image: IMG.tempo,
    seatingCapacity: 17,
    ac: true,
    baseFare: 2000,
    perKmRate: 28,
    rating: 4.3,
    reviewCount: 98,
    amenities: ["AC", "Pushback Seats"],
    cancellation: "non_refundable",
  }),
  v({
    id: "tempo-12-seater",
    categoryId: "tempo-traveller",
    operatorName: "Group Travel Kerala",
    name: "Tempo Traveller (12 Seater)",
    image: IMG.tempo,
    seatingCapacity: 12,
    ac: true,
    baseFare: 1500,
    perKmRate: 24,
    rating: 4.5,
    reviewCount: 143,
    amenities: ["AC", "Music System", "Pushback Seats"],
    cancellation: "non_refundable",
  }),
  // ---------------- Car ----------------
  v({
    id: "swift-dzire-ac",
    categoryId: "car",
    operatorName: "Kerala Drive Rentals",
    name: "Swift Dzire (or equivalent)",
    image: IMG.sedan,
    seatingCapacity: 4,
    luggageCapacity: "2 medium bags",
    ac: true,
    baseFare: 500,
    perKmRate: 14,
    rating: 4.6,
    reviewCount: 312,
    amenities: ["AC", "Music System", "Charging Point"],
    cancellation: "free",
    freeCancellationHoursBeforePickup: 6,
  }),
  v({
    id: "ertiga-ac",
    categoryId: "car",
    operatorName: "Western Ghats Travels",
    name: "Maruti Ertiga (or equivalent)",
    image: IMG.suv,
    seatingCapacity: 6,
    luggageCapacity: "3 large bags",
    ac: true,
    baseFare: 800,
    perKmRate: 18,
    rating: 4.7,
    reviewCount: 256,
    amenities: ["AC", "Music System", "Charging Point", "Extra Legroom"],
    cancellation: "free",
    freeCancellationHoursBeforePickup: 6,
  }),
  v({
    id: "innova-crysta",
    categoryId: "car",
    operatorName: "Kerala Drive Rentals",
    name: "Toyota Innova Crysta",
    image: IMG.suv,
    seatingCapacity: 7,
    luggageCapacity: "4 large bags",
    ac: true,
    baseFare: 950,
    perKmRate: 19,
    rating: 4.8,
    reviewCount: 401,
    amenities: ["AC", "Music System", "Charging Point", "Extra Legroom"],
    cancellation: "free",
    freeCancellationHoursBeforePickup: 12,
  }),
  v({
    id: "camry-luxury",
    categoryId: "car",
    operatorName: "Prestige Chauffeurs",
    name: "Toyota Camry (Luxury)",
    image: IMG.luxurySedan,
    seatingCapacity: 4,
    luggageCapacity: "2 large bags",
    ac: true,
    baseFare: 1200,
    perKmRate: 22,
    rating: 4.9,
    reviewCount: 74,
    amenities: ["AC", "Leather Seats", "Music System", "Charging Point", "Bottled Water"],
    cancellation: "free",
    freeCancellationHoursBeforePickup: 24,
  }),
];

export function getVehicleById(vehicleId: string): VehicleListing | null {
  return MOCK_VEHICLES.find((v) => v.id === vehicleId) ?? null;
}

export function getVehiclesByCategory(categoryId: string): VehicleListing[] {
  return MOCK_VEHICLES.filter((v) => v.categoryId === categoryId);
}

// ─────────────────────────────────────────────────────────────
// KSRTC — a deliberately separate mock service model, NOT a
// relabeled VehicleListing. See lib/vehicle-booking-api.ts for why.
// ─────────────────────────────────────────────────────────────

export interface KsrtcService {
  id: string;
  busType: string;
  departureLocationId: string;
  arrivalLocationId: string;
  departureTime: string;
  arrivalTime: string;
  farePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  serviceConditions: string[];
}

function ksrtc(input: Omit<KsrtcService, "serviceConditions"> & { serviceConditions?: string[] }): KsrtcService {
  return {
    serviceConditions: ["Fixed departure time — no waiting for latecomers", "Online cancellation up to 2 hours before departure", "No meal included"],
    ...input,
  };
}

export const MOCK_KSRTC_SERVICES: KsrtcService[] = [
  ksrtc({
    id: "ksrtc-garuda-001",
    busType: "Garuda Maharaja (AC Volvo)",
    departureLocationId: "kochi",
    arrivalLocationId: "munnar",
    departureTime: "06:30",
    arrivalTime: "10:15",
    farePerSeat: 420,
    totalSeats: 36,
    availableSeats: 14,
  }),
  ksrtc({
    id: "ksrtc-superfast-002",
    busType: "Super Fast",
    departureLocationId: "kochi",
    arrivalLocationId: "munnar",
    departureTime: "08:00",
    arrivalTime: "12:30",
    farePerSeat: 210,
    totalSeats: 48,
    availableSeats: 31,
  }),
  ksrtc({
    id: "ksrtc-ordinary-003",
    busType: "Ordinary",
    departureLocationId: "kochi",
    arrivalLocationId: "munnar",
    departureTime: "11:15",
    arrivalTime: "16:40",
    farePerSeat: 135,
    totalSeats: 52,
    availableSeats: 47,
    serviceConditions: ["Fixed departure time — no waiting for latecomers", "Online cancellation up to 2 hours before departure", "No meal included", "No reclining seats"],
  }),
  ksrtc({
    id: "ksrtc-garuda-004",
    busType: "Garuda Maharaja (AC Volvo)",
    departureLocationId: "kochi",
    arrivalLocationId: "kovalam",
    departureTime: "07:00",
    arrivalTime: "13:30",
    farePerSeat: 560,
    totalSeats: 36,
    availableSeats: 9,
  }),
  ksrtc({
    id: "ksrtc-superfast-005",
    busType: "Super Fast",
    departureLocationId: "kochi",
    arrivalLocationId: "wayanad",
    departureTime: "09:30",
    arrivalTime: "15:45",
    farePerSeat: 380,
    totalSeats: 48,
    availableSeats: 22,
  }),
  ksrtc({
    id: "ksrtc-superfast-006",
    busType: "Super Fast",
    departureLocationId: "kochi",
    arrivalLocationId: "alappuzha",
    departureTime: "10:00",
    arrivalTime: "11:30",
    farePerSeat: 95,
    totalSeats: 48,
    availableSeats: 40,
  }),
];

export function getKsrtcServiceById(serviceId: string): KsrtcService | null {
  return MOCK_KSRTC_SERVICES.find((s) => s.id === serviceId) ?? null;
}
