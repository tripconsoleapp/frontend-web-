/**
 * KSRTC Scheduled Ticket booking — mock repository/API layer (frontend-only).
 * Pages must only ever import from this module (or lib/ksrtc-ticket-state.ts
 * for draft/persisted-ticket state), never from ksrtc-ticket-data.ts
 * directly, so a future real-backend swap touches one file.
 */

import {
  KSRTC_STATIONS,
  findStationByName,
  generateServicesForRoute,
  generateSeatLayout,
  getServiceById,
  calculateFare,
  calculateRefund,
  type KsrtcScheduledService,
  type KsrtcSeatLayout,
  type KsrtcFareBreakdown,
  type KsrtcStation,
} from "./ksrtc-ticket-data";

export const KSRTC_TICKETS_IS_MOCK = true as const;

function simulateLatency<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function listKsrtcStations(): KsrtcStation[] {
  return KSRTC_STATIONS;
}

export function resolveStationByName(name: string): KsrtcStation | null {
  return findStationByName(name);
}

export interface TicketSearchCriteria {
  fromStationId: string;
  toStationId: string;
  journeyDate: string;
  passengers: number;
}

export async function searchScheduledServices(criteria: TicketSearchCriteria): Promise<KsrtcScheduledService[]> {
  const results = generateServicesForRoute(criteria.fromStationId, criteria.toStationId, criteria.journeyDate);
  return simulateLatency(results, 600);
}

export async function getScheduledServiceDetails(serviceId: string): Promise<KsrtcScheduledService | null> {
  return simulateLatency(getServiceById(serviceId), 300);
}

export async function getServiceSeatLayout(serviceId: string): Promise<KsrtcSeatLayout | null> {
  const service = getServiceById(serviceId);
  if (!service) return simulateLatency(null, 300);
  return simulateLatency(generateSeatLayout(service), 400);
}

export function getFareBreakdown(farePerSeat: number, seatCount: number): KsrtcFareBreakdown {
  return calculateFare(farePerSeat, seatCount);
}

export function getRefundAmount(fare: KsrtcFareBreakdown, hoursBeforeDeparture: number): number {
  return calculateRefund(fare, hoursBeforeDeparture);
}

// ─────────────────────────────────────────────────────────────
// Booking (mock)
// ─────────────────────────────────────────────────────────────

export type TicketPaymentMethod = "upi" | "card" | "netbanking";
export type TicketBookingStatus = "CONFIRMED" | "PAYMENT_FAILED";

export interface TicketPassenger {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  seatId: string;
  seatLabel: string;
}

export interface TicketContactDetails {
  phone: string;
  email: string;
}

export interface MockKsrtcTicket {
  isMock: true;
  id: string;
  status: TicketBookingStatus;
  createdAt: string;
  service: KsrtcScheduledService;
  fromLabel: string;
  toLabel: string;
  boardingPointId: string;
  boardingPointLabel: string;
  droppingPointId: string;
  droppingPointLabel: string;
  passengers: TicketPassenger[];
  contact: TicketContactDetails;
  fare: KsrtcFareBreakdown;
  paymentMethod: TicketPaymentMethod;
  cancelledAt?: string;
  refundAmount?: number;
}

function generateTicketReference(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TC-TKT-${suffix}`;
}

export async function createMockTicketBooking(
  input: Omit<MockKsrtcTicket, "isMock" | "id" | "status" | "createdAt">,
  options: { forceFailure?: boolean } = {}
): Promise<MockKsrtcTicket> {
  await simulateLatency(null, 1400);

  if (options.forceFailure) {
    return { ...input, isMock: true, id: generateTicketReference(), status: "PAYMENT_FAILED", createdAt: new Date().toISOString() };
  }

  return { ...input, isMock: true, id: generateTicketReference(), status: "CONFIRMED", createdAt: new Date().toISOString() };
}
