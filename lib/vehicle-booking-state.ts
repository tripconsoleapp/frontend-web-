"use client";

/**
 * Standalone Vehicle Booking — temporary frontend state (mock, frontend-only).
 * Separate sessionStorage keys from Hotel's and from Trip Builder's
 * listingDraft/TripContext — scoped only to "Book a single service → Vehicle".
 *
 * Does NOT import lib/transport-eligibility.ts or any Trip Builder
 * transport state — the 20-passenger KSRTC eligibility rule that applies
 * in the Trip Builder must never reach this module. See
 * components/book/vehicle/transport-mode.tsx for where that's enforced
 * (by simply never calling it).
 */

import type { MockVehicleBooking, PassengerDetails, VehicleSearchCriteria, MockPaymentMethod, TransportMode } from "./vehicle-booking-api";
import type { VehicleCategoryId } from "./vehicle-booking-data";

const DRAFT_KEY = "tripconsole:vehicle-booking-draft";
const BOOKINGS_KEY = "tripconsole:vehicle-bookings-mock";

export interface VehicleBookingDraft {
  search?: VehicleSearchCriteria & { pickupLabel: string; dropLabel: string };
  transportMode?: TransportMode;
  vehicleCategoryId?: VehicleCategoryId;
  /** Supports a multi-vehicle combination — one or more ids, private mode only. */
  selectedVehicleIds?: string[];
  /** KSRTC mode only. */
  selectedKsrtcServiceId?: string;
  passengerDetails?: PassengerDetails;
  paymentMethod?: MockPaymentMethod;
  lastBookingReference?: string;
}

function readDraft(): VehicleBookingDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as VehicleBookingDraft) : {};
  } catch {
    return {};
  }
}

function writeDraft(patch: Partial<VehicleBookingDraft>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...readDraft(), ...patch }));
  } catch {
    // sessionStorage unavailable — flow still works for this render only.
  }
}

export function getVehicleBookingDraft(): VehicleBookingDraft {
  return readDraft();
}

export function saveVehicleSearchCriteria(search: VehicleBookingDraft["search"]) {
  // A new search invalidates every downstream selection.
  writeDraft({ search, transportMode: undefined, vehicleCategoryId: undefined, selectedVehicleIds: undefined, selectedKsrtcServiceId: undefined });
}

export function saveTransportMode(mode: TransportMode) {
  writeDraft({ transportMode: mode, vehicleCategoryId: undefined, selectedVehicleIds: undefined, selectedKsrtcServiceId: undefined });
}

export function saveVehicleCategory(categoryId: VehicleCategoryId) {
  writeDraft({ vehicleCategoryId: categoryId, selectedVehicleIds: undefined });
}

export function saveSelectedVehicleIds(vehicleIds: string[]) {
  writeDraft({ selectedVehicleIds: vehicleIds });
}

export function toggleSelectedVehicle(vehicleId: string): string[] {
  const current = readDraft().selectedVehicleIds ?? [];
  const next = current.includes(vehicleId) ? current.filter((id) => id !== vehicleId) : [...current, vehicleId];
  saveSelectedVehicleIds(next);
  return next;
}

export function saveKsrtcServiceSelection(serviceId: string) {
  writeDraft({ selectedKsrtcServiceId: serviceId });
}

export function savePassengerDetails(passengerDetails: PassengerDetails) {
  writeDraft({ passengerDetails });
}

export function saveVehiclePaymentMethod(paymentMethod: MockPaymentMethod) {
  writeDraft({ paymentMethod });
}

export function clearVehicleBookingDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

function readAllBookings(): Record<string, MockVehicleBooking> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(BOOKINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MockVehicleBooking>) : {};
  } catch {
    return {};
  }
}

export function saveMockVehicleBooking(booking: MockVehicleBooking) {
  if (typeof window === "undefined") return;
  try {
    const all = readAllBookings();
    all[booking.bookingReference] = booking;
    window.sessionStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
    writeDraft({ lastBookingReference: booking.bookingReference });
  } catch {
    // ignore
  }
}

export function getMockVehicleBooking(bookingReference: string): MockVehicleBooking | null {
  return readAllBookings()[bookingReference] ?? null;
}
