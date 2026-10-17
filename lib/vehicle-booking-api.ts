/**
 * Standalone Vehicle Booking — mock repository/API layer (frontend-only).
 * Pages must only ever import from this module, never from
 * vehicle-booking-data.ts directly, so a future real-backend swap
 * touches one file.
 *
 * Pricing is modelled as a generic line-item breakdown
 * (PriceBreakdown.lineItems) rather than forcing Private-combination and
 * KSRTC bookings into one identical shape — a vehicle combination gets
 * one line item per vehicle, a KSRTC booking gets one "fare × seats"
 * line item — but both flow through the same calculateTotal() so the
 * review screen and the payment screen always derive from one source of
 * truth and can never disagree.
 */

import {
  VEHICLE_LOCATIONS,
  VEHICLE_CATEGORIES,
  MOCK_KSRTC_SERVICES,
  computeDistanceKm,
  getVehicleById,
  getVehiclesByCategory,
  getKsrtcServiceById,
  type VehicleListing,
  type VehicleCategory,
  type VehicleCategoryId,
  type KsrtcService,
} from "./vehicle-booking-data";

export const VEHICLE_BOOKING_IS_MOCK = true as const;
export type TransportMode = "private" | "ksrtc";

// ─────────────────────────────────────────────────────────────
// Journey search
// ─────────────────────────────────────────────────────────────

export interface VehicleSearchCriteria {
  pickupLocationId: string;
  dropLocationId: string;
  journeyDate: string;
  pickupTime: string;
  passengers: number;
  isRoundTrip: boolean;
  returnDate?: string;
}

function simulateLatency<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function listVehicleLocations() {
  return VEHICLE_LOCATIONS;
}

export function listVehicleCategories(): VehicleCategory[] {
  return VEHICLE_CATEGORIES;
}

// ─────────────────────────────────────────────────────────────
// Private operator — vehicles by category
// ─────────────────────────────────────────────────────────────

export interface PrivateVehicleResult {
  vehicle: VehicleListing;
  distanceKm: number;
  estimatedPrice: number;
}

function roughVehiclePrice(vehicle: VehicleListing, distanceKm: number, roundTrip: boolean): number {
  const legs = roundTrip ? 2 : 1;
  return vehicle.baseFare + vehicle.perKmRate * distanceKm * legs;
}

export async function searchVehiclesByCategory(categoryId: VehicleCategoryId, criteria: VehicleSearchCriteria): Promise<PrivateVehicleResult[]> {
  const distanceKm = computeDistanceKm(criteria.pickupLocationId, criteria.dropLocationId);
  const results = getVehiclesByCategory(categoryId).map((vehicle) => ({
    vehicle,
    distanceKm,
    estimatedPrice: roughVehiclePrice(vehicle, distanceKm, criteria.isRoundTrip),
  }));
  return simulateLatency(results);
}

export async function getVehicleDetails(vehicleId: string): Promise<VehicleListing | null> {
  return simulateLatency(getVehicleById(vehicleId), 300);
}

export function combinedCapacity(vehicles: VehicleListing[]): number {
  return vehicles.reduce((sum, v) => sum + v.seatingCapacity, 0);
}

// ─────────────────────────────────────────────────────────────
// KSRTC — separate mock service search, not relabeled vehicles
// ─────────────────────────────────────────────────────────────

export async function searchKsrtcServices(criteria: VehicleSearchCriteria): Promise<KsrtcService[]> {
  const results = MOCK_KSRTC_SERVICES.filter((s) => s.departureLocationId === criteria.pickupLocationId && s.arrivalLocationId === criteria.dropLocationId).sort((a, b) =>
    a.departureTime.localeCompare(b.departureTime)
  );
  return simulateLatency(results);
}

export async function getKsrtcServiceDetails(serviceId: string): Promise<KsrtcService | null> {
  return simulateLatency(getKsrtcServiceById(serviceId), 300);
}

// ─────────────────────────────────────────────────────────────
// Generic pricing — one shape for both Private combinations and KSRTC
// ─────────────────────────────────────────────────────────────

export interface PriceLineItem {
  label: string;
  amount: number;
}

export interface PriceBreakdown {
  lineItems: PriceLineItem[];
  subtotal: number;
  taxes: number;
  mandatoryFees: number;
  discount: number;
  totalAmount: number;
}

const TAX_RATE = 0.18; // GST on transport services
const PLATFORM_FEE_RATE = 0.05;

function finalizeBreakdown(lineItems: PriceLineItem[], discount: number, taxRate: number, feeRate: number): PriceBreakdown {
  const subtotal = lineItems.reduce((sum, i) => sum + i.amount, 0);
  const taxes = Math.round(subtotal * taxRate);
  const mandatoryFees = Math.round(subtotal * feeRate);
  const totalAmount = Math.max(0, subtotal + taxes + mandatoryFees - discount);
  return { lineItems, subtotal, taxes, mandatoryFees, discount, totalAmount };
}

/** Private operator — one line item per selected vehicle, summed. */
export function calculateCombinationPrice(vehicles: VehicleListing[], distanceKm: number, isRoundTrip: boolean, discount = 0): PriceBreakdown {
  const legs = isRoundTrip ? 2 : 1;
  const lineItems = vehicles.map((veh) => ({
    label: `${veh.name} (${formatRateLabel(veh, distanceKm, legs)})`,
    amount: veh.baseFare + veh.perKmRate * distanceKm * legs,
  }));
  return finalizeBreakdown(lineItems, discount, TAX_RATE, PLATFORM_FEE_RATE);
}

function formatRateLabel(veh: VehicleListing, distanceKm: number, legs: number): string {
  return `base ₹${veh.baseFare} + ₹${veh.perKmRate}/km × ${distanceKm}km${legs > 1 ? ` × ${legs}` : ""}`;
}

const KSRTC_RESERVATION_FEE_PER_SEAT = 20;

/** KSRTC — flat fare × seats + a small flat per-seat reservation fee, no
 *  18% transport GST slab (public-transport fares don't carry it the
 *  same way private operator fares do in this mock model) — kept as its
 *  own function so a private-operator tax rule is never silently applied
 *  to a KSRTC fare. */
export function calculateKsrtcPrice(service: KsrtcService, passengers: number, discount = 0): PriceBreakdown {
  const lineItems: PriceLineItem[] = [
    { label: `${service.busType} fare — ₹${service.farePerSeat} × ${passengers} seat${passengers === 1 ? "" : "s"}`, amount: service.farePerSeat * passengers },
  ];
  const subtotal = lineItems.reduce((sum, i) => sum + i.amount, 0);
  const mandatoryFees = KSRTC_RESERVATION_FEE_PER_SEAT * passengers;
  const totalAmount = Math.max(0, subtotal + mandatoryFees - discount);
  return { lineItems, subtotal, taxes: 0, mandatoryFees, discount, totalAmount };
}

// ─────────────────────────────────────────────────────────────
// Booking + payment (mock)
// ─────────────────────────────────────────────────────────────

export type MockPaymentMethod = "upi" | "card" | "netbanking";
export type MockBookingStatus = "PENDING" | "CONFIRMED" | "PAYMENT_FAILED" | "CANCELLED";

export interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface JourneySummary {
  pickupLocationId: string;
  pickupLocationName: string;
  dropLocationId: string;
  dropLocationName: string;
  journeyDate: string;
  pickupTime: string;
  isRoundTrip: boolean;
  returnDate?: string;
  passengers: number;
}

export interface PrivateVehicleBookingDetail {
  distanceKm: number;
  vehicles: { id: string; name: string; operatorName: string; categoryId: VehicleCategoryId; seatingCapacity: number; cancellation: VehicleListing["cancellation"]; freeCancellationHoursBeforePickup?: number }[];
  combinedCapacity: number;
}

export interface KsrtcBookingDetail {
  service: { id: string; busType: string; departureTime: string; arrivalTime: string; availableSeatsAtBooking: number };
}

export interface MockVehicleBooking {
  isMock: true;
  bookingReference: string;
  status: MockBookingStatus;
  createdAt: string;
  transportMode: TransportMode;
  journey: JourneySummary;
  privateDetail?: PrivateVehicleBookingDetail;
  ksrtcDetail?: KsrtcBookingDetail;
  passenger: PassengerDetails;
  pricing: PriceBreakdown;
  paymentMethod: MockPaymentMethod;
}

function generateBookingReference(mode: TransportMode): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return mode === "ksrtc" ? `TC-KSRTC-${suffix}` : `TC-RIDE-${suffix}`;
}

export async function createMockBooking(
  input: Omit<MockVehicleBooking, "isMock" | "bookingReference" | "status" | "createdAt">,
  options: { forceFailure?: boolean } = {}
): Promise<MockVehicleBooking> {
  await simulateLatency(null, 1400);

  if (options.forceFailure) {
    return { ...input, isMock: true, bookingReference: generateBookingReference(input.transportMode), status: "PAYMENT_FAILED", createdAt: new Date().toISOString() };
  }

  return { ...input, isMock: true, bookingReference: generateBookingReference(input.transportMode), status: "CONFIRMED", createdAt: new Date().toISOString() };
}
