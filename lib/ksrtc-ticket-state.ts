"use client";

/**
 * KSRTC Scheduled Ticket booking — temporary frontend state (mock,
 * frontend-only). Separate sessionStorage keys from every other booking
 * flow (Vehicle charter, Hotel, Restaurant, Activity, Trip Builder's
 * listingDraft) — scoped only to the standalone /tickets/* flow.
 */

import type { Transaction } from "./mock-wallet";
import type { MockKsrtcTicket, TicketContactDetails, TicketPassenger, TicketPaymentMethod } from "./ksrtc-ticket-api";

const DRAFT_KEY = "tripconsole:ksrtc-ticket-draft";
const TICKETS_KEY = "tripconsole:ksrtc-tickets-mock";

export interface TicketSearchDraft {
  fromStationId: string;
  fromLabel: string;
  toStationId: string;
  toLabel: string;
  journeyDate: string;
  passengers: number;
}

export interface KsrtcTicketDraft {
  search?: TicketSearchDraft;
  selectedServiceId?: string;
  selectedSeatIds?: string[];
  boardingPointId?: string;
  boardingPointLabel?: string;
  droppingPointId?: string;
  droppingPointLabel?: string;
  passengers?: TicketPassenger[];
  contact?: TicketContactDetails;
  paymentMethod?: TicketPaymentMethod;
  lastTicketId?: string;
}

function readDraft(): KsrtcTicketDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as KsrtcTicketDraft) : {};
  } catch {
    return {};
  }
}

function writeDraft(patch: Partial<KsrtcTicketDraft>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...readDraft(), ...patch }));
  } catch {
    // sessionStorage unavailable — flow still works for this render only.
  }
}

export function getTicketDraft(): KsrtcTicketDraft {
  return readDraft();
}

export function saveTicketSearch(search: TicketSearchDraft) {
  // A new search invalidates every downstream selection.
  writeDraft({ search, selectedServiceId: undefined, selectedSeatIds: undefined, boardingPointId: undefined, droppingPointId: undefined, passengers: undefined });
}

export function saveSelectedService(serviceId: string) {
  writeDraft({ selectedServiceId: serviceId, selectedSeatIds: undefined, boardingPointId: undefined, droppingPointId: undefined, passengers: undefined });
}

export function saveSelectedSeats(seatIds: string[]) {
  writeDraft({ selectedSeatIds: seatIds });
}

export function saveBoardingDropping(boardingPointId: string, boardingPointLabel: string, droppingPointId: string, droppingPointLabel: string) {
  writeDraft({ boardingPointId, boardingPointLabel, droppingPointId, droppingPointLabel });
}

export function savePassengerDetails(passengers: TicketPassenger[], contact: TicketContactDetails) {
  writeDraft({ passengers, contact });
}

export function saveTicketPaymentMethod(paymentMethod: TicketPaymentMethod) {
  writeDraft({ paymentMethod });
}

export function clearTicketDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────
// Confirmed tickets (mock) — persisted for /tickets, /tickets/[id], the
// dashboard "Upcoming tickets" row, and the Wallet refund integration.
// ─────────────────────────────────────────────────────────────

function readAllTickets(): Record<string, MockKsrtcTicket> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(TICKETS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, MockKsrtcTicket>) : {};
  } catch {
    return {};
  }
}

function writeAllTickets(all: Record<string, MockKsrtcTicket>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(TICKETS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function saveMockTicket(ticket: MockKsrtcTicket) {
  const all = readAllTickets();
  all[ticket.id] = ticket;
  writeAllTickets(all);
  writeDraft({ lastTicketId: ticket.id });
}

export function getMockTicket(id: string): MockKsrtcTicket | null {
  return readAllTickets()[id] ?? null;
}

export function getAllMockTickets(): MockKsrtcTicket[] {
  return Object.values(readAllTickets()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function cancelMockTicket(id: string, refundAmount: number): MockKsrtcTicket | null {
  const all = readAllTickets();
  const ticket = all[id];
  if (!ticket || ticket.status !== "CONFIRMED") return null;
  const cancelled: MockKsrtcTicket = { ...ticket, cancelledAt: new Date().toISOString(), refundAmount };
  all[id] = cancelled;
  writeAllTickets(all);
  return cancelled;
}

export type TicketLifecycleStatus = "upcoming" | "completed" | "cancelled";

export function getTicketLifecycleStatus(ticket: MockKsrtcTicket): TicketLifecycleStatus {
  if (ticket.cancelledAt) return "cancelled";
  const journeyEnd = new Date(`${ticket.service.journeyDate}T${ticket.service.arrivalTime}:00`);
  return journeyEnd.getTime() < Date.now() ? "completed" : "upcoming";
}

export function getUpcomingMockTickets(): MockKsrtcTicket[] {
  return getAllMockTickets().filter((t) => getTicketLifecycleStatus(t) === "upcoming");
}

/** Cancelled-ticket refunds, shaped as Wallet Transactions, for the
 *  Wallet page to merge alongside lib/mock-wallet.ts's static list — this
 *  file is never mutated, so a real trip-service refund feed can replace
 *  this function later without the Wallet page changing at all. */
export function getTicketRefundTransactions(): Transaction[] {
  return getAllMockTickets()
    .filter((t) => t.cancelledAt && typeof t.refundAmount === "number")
    .map((t) => ({
      id: `txn-ticket-refund-${t.id}`,
      tripId: t.id,
      tripName: `KSRTC Ticket · ${t.fromLabel} → ${t.toLabel}`,
      date: t.cancelledAt as string,
      amount: t.refundAmount as number,
      status: "refunded" as const,
    }));
}
