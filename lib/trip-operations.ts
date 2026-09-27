import {
  AdminReviewStatus,
  CostSnapshot,
  CostSnapshotState,
  IdDocumentType,
  NotificationSeverity,
  NotificationType,
  OperatorAssignmentStatus,
  ParticipantBreakdownEntry,
  PassengerRegistrationStatus,
  PaymentAttempt,
  PaymentMethod,
  PaymentPlan,
  PaymentPlanType,
  PaymentStatus,
  ServiceBookingStatus,
  ServicesDraft,
  Traveler,
  TravelerRegistrationStatus,
  TripNotification,
} from "./listing-draft";
import { hotelServiceCost } from "./hotel-stays";
import { mealPlanTotal } from "./meal-plan";
import { planTotal } from "./activity-plan";

/** The one place Review/Operations read the trip total from — each figure
 *  is the same authoritative function its own service screen already
 *  uses, never a second, independently-computed total. */
export interface TripCostBreakdown {
  vehicle: number;
  hotel: number;
  dining: number;
  activities: number;
  total: number;
}

export function computeTripCostBreakdown(services: ServicesDraft): TripCostBreakdown {
  const vehicle = services.vehicle.configured ? services.vehicle.vehicles.reduce((sum, v) => sum + v.price, 0) : 0;
  const hotel = services.hotel.configured ? hotelServiceCost(services.hotel.stays) : 0;
  const dining = services.restaurant.configured ? mealPlanTotal(services.restaurant.meals) : 0;
  const activities = services.activities.configured ? planTotal(services.activities.destinations) : 0;
  return { vehicle, hotel, dining, activities, total: vehicle + hotel + dining + activities };
}

// ---------------------------------------------------------------------
// Central pricing engine — every screen (Final Review, Cost Console,
// Verification, Payment) reads its numbers from computeTripPricing(),
// never recomputing its own total. computeTripCostBreakdown() above stays
// the one place that reads live service state; everything else builds on
// top of it.
// ---------------------------------------------------------------------

/** Not every trip participant is a "pricing participant" — a school trip's
 *  4 staff are part of the 46 travelers but typically excluded from the
 *  per-student cost. This reads the real breakdown Basics already
 *  captures (Students/Staff) rather than inventing a second headcount:
 *  any entry literally labeled "Staff" is excluded from the pricing base;
 *  a trip with no breakdown (Group/Individual) prices every traveler. */
export function pricingParticipantCount(passengerCount: number, participantBreakdown: ParticipantBreakdownEntry[]): number {
  if (participantBreakdown.length === 0) return passengerCount;
  const pricingEntries = participantBreakdown.filter((e) => e.label.toLowerCase() !== "staff");
  if (pricingEntries.length === 0) return passengerCount;
  return pricingEntries.reduce((sum, e) => sum + e.count, 0);
}

/** Structured so a real contingency rule can be turned on later without
 *  reshaping the pricing engine — this product doesn't currently define
 *  one, so it stays disabled rather than fabricating a percentage. */
export interface ContingencyRule {
  enabled: boolean;
  percentage: number;
}

export const CONTINGENCY_RULE: ContingencyRule = { enabled: false, percentage: 5 };

export interface TripPricing {
  serviceTotals: TripCostBreakdown;
  subtotal: number;
  contingency: number;
  taxes: number;
  discounts: number;
  total: number;
  totalTravelerCount: number;
  pricingParticipantCount: number;
  perParticipantCost: number;
}

export function computeTripPricing(
  services: ServicesDraft,
  participants: { passengerCount: number; participantBreakdown: ParticipantBreakdownEntry[] }
): TripPricing {
  const serviceTotals = computeTripCostBreakdown(services);
  const subtotal = serviceTotals.total;
  const contingency = CONTINGENCY_RULE.enabled ? Math.round((subtotal * CONTINGENCY_RULE.percentage) / 100) : 0;
  const taxes = 0;
  const discounts = 0;
  const total = subtotal + contingency + taxes - discounts;
  const pricingCount = pricingParticipantCount(participants.passengerCount, participants.participantBreakdown);
  return {
    serviceTotals,
    subtotal,
    contingency,
    taxes,
    discounts,
    total,
    totalTravelerCount: participants.passengerCount,
    pricingParticipantCount: pricingCount,
    perParticipantCost: pricingCount > 0 ? Math.round(total / pricingCount) : 0,
  };
}

export function generateSnapshotId() {
  return `snap_${Math.random().toString(36).slice(2, 10)}`;
}

/** Creates the next version in a trip's cost-snapshot history. Never call
 *  this to mutate an existing snapshot — a service change after
 *  submission always produces a new entry, and the caller is responsible
 *  for marking prior entries `superseded` (see `supersedeCostSnapshots`). */
export function createCostSnapshot(pricing: TripPricing, existing: CostSnapshot[]): CostSnapshot {
  return {
    id: generateSnapshotId(),
    version: existing.length + 1,
    createdAt: new Date().toISOString(),
    items: pricing.serviceTotals,
    contingency: pricing.contingency,
    taxes: pricing.taxes,
    discounts: pricing.discounts,
    total: pricing.total,
    totalTravelerCount: pricing.totalTravelerCount,
    pricingParticipantCount: pricing.pricingParticipantCount,
    state: "current",
  };
}

export function supersedeCostSnapshots(snapshots: CostSnapshot[]): CostSnapshot[] {
  return snapshots.map((s): CostSnapshot => (s.state === "current" ? { ...s, state: "superseded" as CostSnapshotState } : s));
}

export function currentCostSnapshot(snapshots: CostSnapshot[]): CostSnapshot | null {
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

const VERIFICATION_LABEL: Record<AdminReviewStatus, string> = {
  pending: "Pending Review",
  in_review: "Under Review",
  approved: "Approved",
  needs_changes: "Changes Requested",
};

export function verificationStatusLabel(status: AdminReviewStatus) {
  return VERIFICATION_LABEL[status];
}

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  locked: "Payment Locked",
  unlocked: "Payment Available",
  pending: "Payment Pending",
  partially_paid: "Partially Paid",
  paid: "Paid",
  failed: "Payment Failed",
};

export function paymentStatusLabel(status: PaymentStatus) {
  return PAYMENT_LABEL[status];
}

// ---------------------------------------------------------------------
// Payment plan + ledger — the single named business rule (advance
// percentage) lives here and nowhere else; every screen that shows an
// advance amount reads it from a PaymentPlan object this module created,
// never re-deriving or re-hardcoding a percentage of its own.
// ---------------------------------------------------------------------

const ADVANCE_PERCENTAGE = 30;
/** Balance is due this many days before departure — the one place this
 *  policy is defined. */
const BALANCE_DUE_DAYS_BEFORE_TRIP = 7;

export interface PaymentPlanOption {
  id: PaymentPlanType;
  label: string;
  description: string;
  amountDueNow: number;
  remainingAfter: number;
  advancePercentage: number;
}

/** The only two payment plans this product currently supports — full
 *  payment, or an advance with the balance due later. The percentage is
 *  read from the one `ADVANCE_PERCENTAGE` constant above, never
 *  hardcoded per screen. */
export function paymentPlanOptions(approvedTotal: number): PaymentPlanOption[] {
  const advance = Math.round((approvedTotal * ADVANCE_PERCENTAGE) / 100);
  return [
    { id: "full", label: "Full Payment", description: "Pay the entire approved amount now.", amountDueNow: approvedTotal, remainingAfter: 0, advancePercentage: 100 },
    {
      id: "advance_balance",
      label: `${ADVANCE_PERCENTAGE}% Advance + Balance Later`,
      description: "Secure the booking now, pay the remaining balance before the trip.",
      amountDueNow: advance,
      remainingAfter: approvedTotal - advance,
      advancePercentage: ADVANCE_PERCENTAGE,
    },
  ];
}

function computeBalanceDueDate(tripStartDate: string): string {
  const now = new Date();
  if (!tripStartDate) return now.toISOString();
  const due = new Date(tripStartDate);
  due.setDate(due.getDate() - BALANCE_DUE_DAYS_BEFORE_TRIP);
  return (due < now ? now : due).toISOString();
}

export function generatePaymentPlanId() {
  return `plan_${Math.random().toString(36).slice(2, 10)}`;
}

/** Fixes the plan's amounts against one specific approved snapshot —
 *  `isPaymentPlanStale` is how a caller later checks whether the trip has
 *  since been re-verified against a different snapshot, at which point
 *  this plan must be discarded and a new one created. */
export function createPaymentPlan(type: PaymentPlanType, snapshot: CostSnapshot, tripStartDate: string): PaymentPlan {
  const option = paymentPlanOptions(snapshot.total).find((o) => o.id === type)!;
  return {
    id: generatePaymentPlanId(),
    type,
    snapshotId: snapshot.id,
    advancePercentage: option.advancePercentage,
    advanceAmount: option.amountDueNow,
    balanceAmount: option.remainingAfter,
    balanceDueDate: option.remainingAfter > 0 ? computeBalanceDueDate(tripStartDate) : null,
  };
}

export function isPaymentPlanStale(plan: PaymentPlan | null, currentSnapshotId: string | null): boolean {
  return Boolean(plan && currentSnapshotId && plan.snapshotId !== currentSnapshotId);
}

export function isBalanceOverdue(plan: PaymentPlan | null, remaining: number): boolean {
  return Boolean(plan?.balanceDueDate && remaining > 0 && new Date(plan.balanceDueDate).getTime() < Date.now());
}

export function generateTransactionId() {
  const year = new Date().getFullYear();
  return `TXN-TC-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

export function generatePaymentAttemptId() {
  return `pay_${Math.random().toString(36).slice(2, 10)}`;
}

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: "Card",
  upi: "UPI",
  netbanking: "Net Banking",
};

export function paymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHOD_LABEL[method];
}

/** The only formula for "how much has actually been paid" — sums
 *  `succeeded` attempts only. A `processing`, `pending`, or `failed`
 *  attempt never contributes, and a retried attempt after a failure adds
 *  a new ledger entry rather than replacing the old one. */
export function totalPaidAmount(attempts: PaymentAttempt[]): number {
  return attempts.filter((a) => a.status === "succeeded").reduce((sum, a) => sum + a.amount, 0);
}

export function remainingBalance(approvedTotal: number, attempts: PaymentAttempt[]): number {
  return Math.max(0, approvedTotal - totalPaidAmount(attempts));
}

/** The single authoritative payment status for a trip — never stored
 *  directly, always recomputed from the ledger so it can't drift out of
 *  sync with the attempts that actually happened. */
export function derivePaymentStatus(params: { verificationApproved: boolean; approvedTotal: number; attempts: PaymentAttempt[] }): PaymentStatus {
  if (!params.verificationApproved) return "locked";
  const latest = params.attempts[params.attempts.length - 1];
  if (latest && (latest.status === "processing" || latest.status === "pending")) return "pending";
  const paid = totalPaidAmount(params.attempts);
  if (params.approvedTotal > 0 && paid >= params.approvedTotal) return "paid";
  if (paid > 0) return "partially_paid";
  if (latest && latest.status === "failed") return "failed";
  return "unlocked";
}

export function latestSuccessfulTransactionId(attempts: PaymentAttempt[]): string | null {
  const succeeded = attempts.filter((a) => a.status === "succeeded");
  return succeeded.length > 0 ? succeeded[succeeded.length - 1].transactionId : null;
}

/** True while an attempt against this exact plan is mid-flight — the
 *  payment UI uses this to refuse a second submission instead of firing a
 *  duplicate transaction. */
export function hasInFlightAttempt(attempts: PaymentAttempt[], paymentPlanId: string) {
  return attempts.some((a) => a.paymentPlanId === paymentPlanId && (a.status === "processing" || a.status === "pending"));
}

export function generateTripReference() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `TC-${year}-${seq}`;
}

export function generateRegistrationToken() {
  return Math.random().toString(36).slice(2, 10);
}

export function generateTravelerId() {
  return `pax_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateRegistrationId() {
  return `REG-${String(Math.floor(10000 + Math.random() * 90000))}`;
}

/** The one source of truth for every headcount shown across Operations,
 *  Passenger Management, the roster, and reminders — every screen derives
 *  these from the same traveler list, never a hardcoded number. */
export interface RegistrationStats {
  expected: number;
  registered: number;
  verified: number;
  pending: number;
  needsCorrection: number;
  remaining: number;
}

export function registrationStats(travelers: Traveler[], expected: number): RegistrationStats {
  const registered = travelers.length;
  const verified = travelers.filter((t) => t.registrationStatus === "verified").length;
  const needsCorrection = travelers.filter((t) => t.registrationStatus === "needs_correction").length;
  const pending = travelers.filter((t) => t.registrationStatus === "submitted").length;
  return {
    expected,
    registered,
    verified,
    pending,
    needsCorrection,
    remaining: Math.max(0, expected - registered),
  };
}

export function deriveRegistrationStatus(
  travelers: Traveler[],
  expected: number,
  linkGenerated: boolean
): PassengerRegistrationStatus {
  if (travelers.length === 0) return linkGenerated ? "open" : "not_started";
  if (expected > 0 && travelers.length >= expected) return "complete";
  return "in_progress";
}

const TRAVELER_STATUS_LABEL: Record<TravelerRegistrationStatus, string> = {
  invited: "Invited",
  submitted: "Pending Review",
  needs_correction: "Needs Correction",
  verified: "Verified",
};

export function travelerStatusLabel(status: TravelerRegistrationStatus) {
  return TRAVELER_STATUS_LABEL[status];
}

const ID_TYPE_LABEL: Record<IdDocumentType, string> = {
  passport: "Passport",
  aadhaar: "Aadhaar",
  school_id: "School ID",
  driving_license: "Driving License",
  other: "ID",
};

export function idTypeLabel(type: IdDocumentType | null) {
  return type ? ID_TYPE_LABEL[type] : "ID";
}

/** Never show a full ID number in a list view — only the last 4
 *  characters, prefixed by the document type. */
export function maskIdNumber(idType: IdDocumentType | null, idNumber: string | null) {
  if (!idNumber) return `${idTypeLabel(idType)} — not provided`;
  const tail = idNumber.replace(/\s/g, "").slice(-4);
  return `${idTypeLabel(idType)} •••• ${tail}`;
}

// ---------------------------------------------------------------------
// CSV import — the project has no spreadsheet-parsing library, so bulk
// import works against a CSV template rather than fabricating .xlsx
// binary support. Columns: Full Name, Traveler Type, ID Type, ID Number,
// Phone Number.
// ---------------------------------------------------------------------

export interface ImportRow {
  rowNumber: number;
  name: string;
  travelerType: string;
  idType: string;
  idNumber: string;
  phone: string;
  issues: string[];
}

const VALID_ID_TYPES = ["passport", "aadhaar", "school_id", "driving_license", "other"];
const VALID_TRAVELER_TYPES = ["student", "staff", "traveler"];

export function parseCsv(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const dataLines = /full\s*name/i.test(lines[0]) ? lines.slice(1) : lines;

  return dataLines.map((line, index) => {
    const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const [name = "", travelerType = "traveler", idType = "other", idNumber = "", phone = ""] = cells;
    return { rowNumber: index + 1, name, travelerType: travelerType.toLowerCase(), idType: idType.toLowerCase(), idNumber, phone, issues: [] };
  });
}

export function validateImportRows(rows: ImportRow[]): ImportRow[] {
  const seenIds = new Map<string, number>();
  for (const row of rows) {
    const idKey = row.idNumber.replace(/\s/g, "").toLowerCase();
    if (idKey) seenIds.set(idKey, (seenIds.get(idKey) ?? 0) + 1);
  }

  return rows.map((row) => {
    const issues: string[] = [];
    if (!row.name) issues.push("Missing name");
    if (!row.idNumber) issues.push("Missing ID number");
    if (!row.phone) issues.push("Missing phone number");
    else if (!/^\+?[0-9\s-]{7,15}$/.test(row.phone)) issues.push("Invalid phone number format");
    if (row.idType && !VALID_ID_TYPES.includes(row.idType)) issues.push(`Unrecognized ID type "${row.idType}"`);
    if (row.travelerType && !VALID_TRAVELER_TYPES.includes(row.travelerType)) issues.push(`Unrecognized traveler type "${row.travelerType}"`);
    const idKey = row.idNumber.replace(/\s/g, "").toLowerCase();
    if (idKey && (seenIds.get(idKey) ?? 0) > 1) issues.push("Duplicate ID number in this file");
    return { ...row, issues };
  });
}

export function importRowToTraveler(row: ImportRow): Traveler {
  const now = new Date().toISOString();
  return {
    id: generateTravelerId(),
    name: row.name,
    travelerType: (VALID_TRAVELER_TYPES.includes(row.travelerType) ? row.travelerType : "traveler") as Traveler["travelerType"],
    idType: (VALID_ID_TYPES.includes(row.idType) ? row.idType : "other") as IdDocumentType,
    idNumber: row.idNumber,
    phone: row.phone,
    hasIdPhoto: false,
    source: "import",
    registrationStatus: "submitted",
    createdAt: now,
    updatedAt: now,
  };
}

export const CSV_TEMPLATE = "Full Name,Traveler Type,ID Type,ID Number,Phone Number\nJohn Doe,student,passport,P1234567,+91 9876543210\n";

// ---------------------------------------------------------------------
// Registration share layer — localStorage, not sessionStorage, mirroring
// the meal guest-share pattern in meal-plan.ts. The organizer's own
// sessionStorage draft is per-tab and would never be visible to a
// traveler's tab opening the link, so the public snapshot and the
// self-registrations a traveler submits both live in localStorage keyed
// by the registration token, and the organizer's roster pulls any new
// self-registrations in on load.
// ---------------------------------------------------------------------

const REGISTRATION_SNAPSHOT_PREFIX = "tripconsole:trip-register:";
const REGISTRATION_SUBMISSIONS_PREFIX = "tripconsole:trip-registrations:";

export interface RegistrationSnapshot {
  token: string;
  tripId: string;
  tripName: string;
  expectedCount: number;
}

export function saveRegistrationSnapshot(snapshot: RegistrationSnapshot) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REGISTRATION_SNAPSHOT_PREFIX + snapshot.token, JSON.stringify(snapshot));
  } catch {
    // localStorage unavailable — the share link simply won't resolve.
  }
}

export function getRegistrationSnapshot(token: string): RegistrationSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REGISTRATION_SNAPSHOT_PREFIX + token);
    return raw ? (JSON.parse(raw) as RegistrationSnapshot) : null;
  } catch {
    return null;
  }
}

export function getSelfRegistrations(token: string): Traveler[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REGISTRATION_SUBMISSIONS_PREFIX + token);
    return raw ? (JSON.parse(raw) as Traveler[]) : [];
  } catch {
    return [];
  }
}

export function addSelfRegistration(token: string, traveler: Traveler) {
  if (typeof window === "undefined") return;
  try {
    const current = getSelfRegistrations(token);
    window.localStorage.setItem(REGISTRATION_SUBMISSIONS_PREFIX + token, JSON.stringify([...current, traveler]));
  } catch {
    // localStorage unavailable — the submission just won't be recorded.
  }
}

// ---------------------------------------------------------------------
// Trip readiness — computed, never a hardcoded flag.
// ---------------------------------------------------------------------

export interface TripReadiness {
  ready: boolean;
  unmet: string[];
}

export function computeTripReadiness(params: {
  tripSubmitted: boolean;
  registrationStatus: PassengerRegistrationStatus;
  travelers: Traveler[];
  verificationStatus: AdminReviewStatus;
  paymentStatus: PaymentStatus;
  operatorAssignmentStatus: OperatorAssignmentStatus;
  hotelConfigured: boolean;
  hotelBookingStatus: ServiceBookingStatus;
  mealsConfigured: boolean;
  mealsBookingStatus: ServiceBookingStatus;
  activitiesConfigured: boolean;
  activitiesBookingStatus: ServiceBookingStatus;
}): TripReadiness {
  const unmet: string[] = [];
  if (!params.tripSubmitted) unmet.push("Trip has not been submitted");
  if (params.registrationStatus !== "complete") unmet.push("Passenger registration is not complete");
  const outstanding = params.travelers.filter((t) => t.registrationStatus !== "verified").length;
  if (outstanding > 0) unmet.push(`${outstanding} traveler${outstanding === 1 ? "" : "s"} still need verification`);
  if (params.verificationStatus !== "approved") unmet.push("Admin verification is not yet approved");
  if (params.paymentStatus !== "paid") unmet.push("Payment is not yet complete");
  if (params.operatorAssignmentStatus !== "confirmed") unmet.push("Transport operator is not yet confirmed");
  if (params.hotelConfigured && params.hotelBookingStatus !== "confirmed") unmet.push("Hotel booking is not yet confirmed");
  if (params.mealsConfigured && params.mealsBookingStatus !== "confirmed") unmet.push("Meal booking is not yet confirmed");
  if (params.activitiesConfigured && params.activitiesBookingStatus !== "confirmed") unmet.push("Activity booking is not yet confirmed");
  return { ready: unmet.length === 0, unmet };
}

/** For the Cost Console's "Cost updated" banner — compares a live pricing
 *  total against the last snapshot so a service edit never silently
 *  changes the number the organizer already saw. */
export function formatCostDelta(delta: number, formatCurrency: (n: number) => string) {
  if (delta === 0) return null;
  const sign = delta > 0 ? "+" : "-";
  return `${sign}${formatCurrency(Math.abs(delta))}`;
}

// ---------------------------------------------------------------------
// Notifications — created only at real state-transition call sites
// (payment succeeded/failed, verification decided, a booking confirmed).
// Never a decorative or scheduled entry.
// ---------------------------------------------------------------------

export function createNotification(input: { type: NotificationType; severity: NotificationSeverity; title: string; message: string; actionHref?: string | null }): TripNotification {
  return {
    id: `notif_${Math.random().toString(36).slice(2, 10)}`,
    type: input.type,
    severity: input.severity,
    title: input.title,
    message: input.message,
    createdAt: new Date().toISOString(),
    read: false,
    actionHref: input.actionHref ?? null,
  };
}
