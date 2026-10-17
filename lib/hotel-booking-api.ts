/**
 * Standalone Hotel Booking — mock repository/API layer (Phase 1).
 *
 * Every exported function here is a MOCK implementation backed by
 * lib/hotel-booking-data.ts. Pages must only ever import from this module,
 * never from hotel-booking-data.ts directly — that's what makes a future
 * swap to the real backend (GET /search/listings?type=HOTEL,
 * POST /bookings/initiate, POST /payments/create-order, per the backend
 * audit) a change to this one file, not a rewrite of every screen.
 *
 * KNOWN BACKEND GAP (see conversation record): the real
 * `POST /bookings/initiate` endpoint has no `roomTypeId` field — it always
 * prices off the cheapest room type on the listing. This mock layer
 * intentionally mirrors that limitation (see `createMockBooking`'s doc
 * comment) rather than pretending the future integration will be able to
 * honor an arbitrary room choice.
 */

import { HOTEL_DESTINATIONS, MOCK_HOTELS, getHotelById, type Hotel, type HotelRoomOption } from "./hotel-booking-data";

export const HOTEL_BOOKING_IS_MOCK = true as const;

// ─────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────

export interface HotelSearchCriteria {
  destinationId: string;
  checkIn: string; // ISO yyyy-mm-dd
  checkOut: string; // ISO yyyy-mm-dd
  adults: number;
  children: number;
  childrenAges: number[];
  rooms: number;
}

export interface HotelSearchResult {
  hotel: Hotel;
  /** Cheapest room's nightly price — always labelled "from" in the UI,
   *  since the room actually booked may cost more. */
  fromPricePerNight: number;
  totalForStay: number;
  nights: number;
  hasFreeCancellation: boolean;
}

export type SortOrder = "recommended" | "price_low" | "price_high" | "guest_rating" | "star_rating";

export interface HotelSearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minStarRating?: number;
  minGuestRating?: number;
  amenities?: string[];
  freeCancellationOnly?: boolean;
  propertyTypes?: Hotel["propertyType"][];
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const inMs = new Date(`${checkIn}T00:00:00`).getTime();
  const outMs = new Date(`${checkOut}T00:00:00`).getTime();
  return Math.max(0, Math.round((outMs - inMs) / 86_400_000));
}

function simulateLatency<T>(value: T, ms = 550): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function listDestinations() {
  return HOTEL_DESTINATIONS;
}

export async function searchHotels(
  criteria: HotelSearchCriteria,
  filters: HotelSearchFilters = {},
  sort: SortOrder = "recommended"
): Promise<HotelSearchResult[]> {
  const nights = nightsBetween(criteria.checkIn, criteria.checkOut);
  const totalGuests = criteria.adults + criteria.children;

  let results: HotelSearchResult[] = MOCK_HOTELS.filter((h) => h.destinationId === criteria.destinationId)
    .map((hotel) => {
      const cheapest = hotel.rooms.reduce((min, r) => (r.pricePerNight < min.pricePerNight ? r : min));
      return {
        hotel,
        fromPricePerNight: cheapest.pricePerNight,
        totalForStay: cheapest.pricePerNight * Math.max(1, nights) * criteria.rooms,
        nights,
        hasFreeCancellation: hotel.rooms.some((r) => r.cancellation === "free"),
      };
    })
    // A property only shows up if at least one of its rooms could fit the
    // party across the requested room count — mirrors the real occupancy
    // check a backend would run, even though this is mock data.
    .filter((r) => r.hotel.rooms.some((room) => room.maxGuests * criteria.rooms >= totalGuests));

  if (filters.minPrice !== undefined) results = results.filter((r) => r.fromPricePerNight >= filters.minPrice!);
  if (filters.maxPrice !== undefined) results = results.filter((r) => r.fromPricePerNight <= filters.maxPrice!);
  if (filters.minStarRating !== undefined) results = results.filter((r) => r.hotel.starRating >= filters.minStarRating!);
  if (filters.minGuestRating !== undefined) results = results.filter((r) => r.hotel.guestRating >= filters.minGuestRating!);
  if (filters.freeCancellationOnly) results = results.filter((r) => r.hasFreeCancellation);
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    results = results.filter((r) => filters.propertyTypes!.includes(r.hotel.propertyType));
  }
  if (filters.amenities && filters.amenities.length > 0) {
    results = results.filter((r) => filters.amenities!.every((a) => r.hotel.amenities.includes(a)));
  }

  switch (sort) {
    case "price_low":
      results = [...results].sort((a, b) => a.fromPricePerNight - b.fromPricePerNight);
      break;
    case "price_high":
      results = [...results].sort((a, b) => b.fromPricePerNight - a.fromPricePerNight);
      break;
    case "guest_rating":
      results = [...results].sort((a, b) => b.hotel.guestRating - a.hotel.guestRating);
      break;
    case "star_rating":
      results = [...results].sort((a, b) => b.hotel.starRating - a.hotel.starRating);
      break;
    case "recommended":
    default:
      results = [...results].sort((a, b) => b.hotel.guestRating * b.hotel.reviewCount - a.hotel.guestRating * a.hotel.reviewCount);
  }

  return simulateLatency(results);
}

export async function getHotelDetails(hotelId: string): Promise<Hotel | null> {
  return simulateLatency(getHotelById(hotelId), 350);
}

// ─────────────────────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────────────────────

export interface PriceBreakdown {
  pricePerNight: number;
  nights: number;
  roomCount: number;
  baseAmount: number;
  taxes: number;
  mandatoryFees: number;
  discount: number;
  totalAmount: number;
}

const TAX_RATE = 0.12; // flat 12% — mirrors the real backend's sub-₹7,500 GST slab
const PLATFORM_FEE_RATE = 0.05;

export function calculateHotelPrice(room: HotelRoomOption, nights: number, roomCount: number, discount = 0): PriceBreakdown {
  const baseAmount = room.pricePerNight * nights * roomCount;
  const taxes = Math.round(baseAmount * TAX_RATE);
  const mandatoryFees = Math.round(baseAmount * PLATFORM_FEE_RATE);
  const totalAmount = Math.max(0, baseAmount + taxes + mandatoryFees - discount);
  return { pricePerNight: room.pricePerNight, nights, roomCount, baseAmount, taxes, mandatoryFees, discount, totalAmount };
}

// ─────────────────────────────────────────────────────────────
// Booking + payment (mock)
// ─────────────────────────────────────────────────────────────

export type MockPaymentMethod = "upi" | "card" | "netbanking";
export type MockBookingStatus = "PENDING" | "CONFIRMED" | "PAYMENT_FAILED" | "CANCELLED";

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface MockBooking {
  isMock: true;
  bookingReference: string;
  status: MockBookingStatus;
  createdAt: string;
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  roomId: string;
  roomName: string;
  mealPlan: HotelRoomOption["mealPlan"];
  cancellation: HotelRoomOption["cancellation"];
  freeCancellationDaysBeforeCheckIn?: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  childrenAges: number[];
  roomCount: number;
  guest: GuestDetails;
  pricing: PriceBreakdown;
  paymentMethod: MockPaymentMethod;
}

function generateBookingReference(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TC-HOTEL-${suffix}`;
}

/**
 * Simulates POST /bookings/initiate + POST /payments/create-order +
 * Razorpay checkout + webhook confirmation, collapsed into one call since
 * there is no real backend behind this yet.
 *
 * `forceFailure` exists purely so the Payment screen's failure state is
 * reachable in testing/dev — the real integration will instead branch on
 * an actual Razorpay failure callback.
 */
export async function createMockBooking(
  input: Omit<MockBooking, "isMock" | "bookingReference" | "status" | "createdAt">,
  options: { forceFailure?: boolean } = {}
): Promise<MockBooking> {
  await simulateLatency(null, 1400);

  if (options.forceFailure) {
    return {
      ...input,
      isMock: true,
      bookingReference: generateBookingReference(),
      status: "PAYMENT_FAILED",
      createdAt: new Date().toISOString(),
    };
  }

  const booking: MockBooking = {
    ...input,
    isMock: true,
    bookingReference: generateBookingReference(),
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  };
  return booking;
}
