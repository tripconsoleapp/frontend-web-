"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Bell, Check, CreditCard, FileText, Receipt, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDateRange } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { ServicesDraft, TripRecord, getServicesDraft, getTripRecord, saveTripRecord } from "@/lib/listing-draft";
import { computeTripReadiness, createNotification, currentCostSnapshot, derivePaymentStatus, latestSuccessfulTransactionId, registrationStats, remainingBalance, totalPaidAmount } from "@/lib/trip-operations";

type StageState = "done" | "active" | "attention" | "pending";

interface Stage {
  key: string;
  title: string;
  state: StageState;
  detail: string;
  href?: string;
  cta?: string;
}

export function OperationsHub({ tripId }: { tripId: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const [record, setRecord] = useState<TripRecord | null>(null);
  const [services, setServices] = useState<ServicesDraft | null>(null);

  useEffect(() => {
    setRecord(getTripRecord());
    setServices(getServicesDraft());
  }, []);

  if (!record || !services) {
    return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;
  }

  if (record.id !== tripId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This trip couldn&rsquo;t be found.</p>
        <Link href="/trips" className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to My Trips
        </Link>
      </div>
    );
  }

  const stats = registrationStats(record.passengerManagement.travelers, trip.passengerCount);
  const snapshot = currentCostSnapshot(record.costSnapshots);
  const verificationApproved = record.verification.status === "approved";
  const paymentStatus = derivePaymentStatus({ verificationApproved, approvedTotal: snapshot?.total ?? 0, attempts: record.payment.attempts });
  const totalPaid = totalPaidAmount(record.payment.attempts);
  const paymentRemaining = snapshot ? remainingBalance(snapshot.total, record.payment.attempts) : 0;
  const paymentReference = latestSuccessfulTransactionId(record.payment.attempts);
  const unreadNotifications = record.notifications.filter((n) => !n.read).length;
  const readiness = computeTripReadiness({
    tripSubmitted: record.status !== "draft",
    registrationStatus: record.passengerManagement.registrationStatus,
    travelers: record.passengerManagement.travelers,
    verificationStatus: record.verification.status,
    paymentStatus,
    operatorAssignmentStatus: record.operations.operatorAssignment.status,
    hotelConfigured: services.hotel.configured,
    hotelBookingStatus: record.operations.hotelBooking.status,
    mealsConfigured: services.restaurant.configured,
    mealsBookingStatus: record.operations.mealsBooking.status,
    activitiesConfigured: services.activities.configured,
    activitiesBookingStatus: record.operations.activitiesBooking.status,
  });

  const passengerState: StageState =
    record.passengerManagement.registrationStatus === "complete" && stats.needsCorrection === 0 && stats.pending === 0
      ? "done"
      : record.passengerManagement.registrationStatus === "not_started"
        ? "pending"
        : stats.needsCorrection > 0
          ? "attention"
          : "active";

  const paymentState: StageState =
    paymentStatus === "paid"
      ? "done"
      : paymentStatus === "failed"
        ? "attention"
        : paymentStatus === "locked"
          ? "pending"
          : "active";

  const bookingChecks = [
    record.operations.operatorAssignment.status === "confirmed",
    !services.hotel.configured || record.operations.hotelBooking.status === "confirmed",
    !services.restaurant.configured || record.operations.mealsBooking.status === "confirmed",
    !services.activities.configured || record.operations.activitiesBooking.status === "confirmed",
  ];
  const bookingsConfirmed = bookingChecks.every(Boolean);
  const operationsState: StageState = bookingsConfirmed
    ? "done"
    : paymentStatus === "paid" || paymentStatus === "partially_paid"
      ? "active"
      : "pending";

  const bookingRows: { key: "operatorAssignment" | "hotelBooking" | "mealsBooking" | "activitiesBooking"; label: string; applicable: boolean }[] = [
    { key: "operatorAssignment", label: "Transport Operator", applicable: true },
    { key: "hotelBooking", label: "Hotel", applicable: services.hotel.configured },
    { key: "mealsBooking", label: "Meals", applicable: services.restaurant.configured },
    { key: "activitiesBooking", label: "Activities", applicable: services.activities.configured },
  ];

  function confirmBooking(key: "operatorAssignment" | "hotelBooking" | "mealsBooking" | "activitiesBooking") {
    if (!record || !services) return;
    const nextOperations = {
      ...record.operations,
      [key]: key === "operatorAssignment" ? { status: "confirmed" as const } : { status: "confirmed" as const },
    };
    const nextReadiness = computeTripReadiness({
      tripSubmitted: record.status !== "draft",
      registrationStatus: record.passengerManagement.registrationStatus,
      travelers: record.passengerManagement.travelers,
      verificationStatus: record.verification.status,
      paymentStatus,
      operatorAssignmentStatus: key === "operatorAssignment" ? "confirmed" : record.operations.operatorAssignment.status,
      hotelConfigured: services.hotel.configured,
      hotelBookingStatus: key === "hotelBooking" ? "confirmed" : record.operations.hotelBooking.status,
      mealsConfigured: services.restaurant.configured,
      mealsBookingStatus: key === "mealsBooking" ? "confirmed" : record.operations.mealsBooking.status,
      activitiesConfigured: services.activities.configured,
      activitiesBookingStatus: key === "activitiesBooking" ? "confirmed" : record.operations.activitiesBooking.status,
    });
    const label = bookingRows.find((r) => r.key === key)?.label ?? "Service";
    const notification = createNotification({
      type: "booking",
      severity: "success",
      title: `${label} confirmed`,
      message: nextReadiness.ready ? `${label} is confirmed and your trip is now ready.` : `${label} has been confirmed for this trip.`,
      actionHref: `/trips/${tripId}/operations`,
    });
    const next: TripRecord = {
      ...record,
      status: nextReadiness.ready && record.status === "paid" ? "complete" : record.status,
      operations: nextOperations,
      notifications: [...record.notifications, notification],
    };
    saveTripRecord(next);
    setRecord(next);
  }

  const stages: Stage[] = [
    {
      key: "submitted",
      title: "Trip Submitted",
      state: "done",
      detail: record.submittedAt ? `Submitted ${new Date(record.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "",
    },
    {
      key: "snapshot",
      title: "Cost Snapshot Locked",
      state: snapshot ? "done" : "pending",
      detail: snapshot ? `Version ${snapshot.version} · ${formatCurrency(snapshot.total)}` : "No snapshot yet",
      href: snapshot ? `/trips/${tripId}/cost/snapshot` : undefined,
      cta: snapshot ? "View snapshot" : undefined,
    },
    {
      key: "verification",
      title: "Admin Verification",
      state:
        record.verification.status === "approved"
          ? "done"
          : record.verification.status === "needs_changes"
            ? "attention"
            : record.verification.status === "in_review"
              ? "active"
              : "pending",
      detail:
        record.verification.status === "approved"
          ? "Approved by TripConsole"
          : record.verification.status === "needs_changes"
            ? record.verification.notes ?? "Changes requested — review and resubmit"
            : record.verification.status === "in_review"
              ? "Being reviewed by our team"
              : "Awaiting review",
      href: `/trips/${tripId}/verification`,
      cta: record.verification.status === "needs_changes" ? "Review & Fix" : "View details",
    },
    {
      key: "passengers",
      title: "Passenger Details",
      state: passengerState,
      detail: stats.expected === 0 ? "No travelers expected" : `${stats.registered} / ${stats.expected} registered · ${stats.verified} verified`,
      href: `/trips/${tripId}/passengers`,
      cta: record.passengerManagement.registrationStatus === "not_started" ? "Start collecting details" : "Manage passengers",
    },
    {
      key: "payment",
      title: "Payment",
      state: paymentState,
      detail:
        paymentStatus === "locked"
          ? "Unlocks once verification is approved"
          : paymentStatus === "paid"
            ? `Paid in full${paymentReference ? ` · ${paymentReference}` : ""}`
            : paymentStatus === "partially_paid"
              ? `${formatCurrency(paymentRemaining)} balance remaining`
              : paymentStatus === "failed"
                ? "Last attempt failed — retry payment"
                : "Ready to choose a payment plan",
      href: paymentStatus === "locked" ? undefined : `/trips/${tripId}/payment`,
      cta:
        paymentStatus === "unlocked"
          ? "Choose Payment Plan"
          : paymentStatus === "failed"
            ? "Retry Payment"
            : paymentStatus !== "locked"
              ? "View Payment"
              : undefined,
    },
    {
      key: "operations",
      title: "Operator & Service Bookings",
      state: operationsState,
      detail: bookingsConfirmed ? "All bookings confirmed" : "Transport, hotel, meal and activity bookings are being finalized",
    },
    { key: "ready", title: "Trip Ready", state: readiness.ready ? "done" : "pending", detail: readiness.ready ? "All requirements met" : "Waiting on the steps above" },
  ];

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } } };
  const item: Variants = shouldReduce ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.26 } } };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">{record.reference}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{trip.tripName || "Trip Operations"}</h1>
          <p className="mt-1 font-body text-sm text-text-grey">
            {trip.dateRangeLabel || formatDateRange(trip.startDate, trip.endDate)} &middot; {trip.passengerCount} Travelers
          </p>
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-mint/40 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-navy">
            {readiness.ready ? "complete" : record.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/trips/${tripId}/notifications`} className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:bg-navy/5">
            <Bell size={15} />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 font-body text-[10px] font-bold text-white">{unreadNotifications}</span>
            )}
          </Link>
          <Link href={`/trips/${tripId}/documents`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:bg-navy/5">
            <FileText size={15} />
          </Link>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
        {stages.map((stage, i) => (
          <motion.div key={stage.key} variants={item} className="flex gap-4 border-b border-navy/10 py-5 first:pt-0 last:border-b-0">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-body text-xs font-semibold",
                  stage.state === "done"
                    ? "bg-navy text-white"
                    : stage.state === "active"
                      ? "border-2 border-orange text-orange"
                      : stage.state === "attention"
                        ? "border-2 border-destructive text-destructive"
                        : "border border-navy/15 text-navy/30"
                )}
              >
                {stage.state === "done" ? <Check size={14} /> : i + 1}
              </span>
              {i < stages.length - 1 && <span className={cn("mt-1 w-px flex-1", stage.state === "done" ? "bg-navy/30" : "bg-navy/10")} />}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-base font-semibold text-navy">{stage.title}</p>
                {stage.href && stage.cta && (
                  <button type="button" onClick={() => router.push(stage.href!)} className="inline-flex items-center gap-1 font-body text-sm font-semibold text-orange underline underline-offset-2">
                    {stage.cta} <ArrowRight size={12} />
                  </button>
                )}
              </div>
              <p className={cn("mt-0.5 font-body text-sm", stage.state === "attention" ? "text-destructive" : "text-text-grey")}>{stage.detail}</p>
              {stage.key === "operations" && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {bookingRows
                    .filter((row) => row.applicable)
                    .map((row) => {
                      const confirmed = record.operations[row.key].status === "confirmed";
                      return (
                        <div key={row.key} className="flex items-center justify-between gap-3">
                          <span className="font-body text-sm text-navy">{row.label}</span>
                          {confirmed ? (
                            <span className="flex items-center gap-1 font-body text-xs font-medium text-navy"><Check size={12} /> Confirmed</span>
                          ) : (
                            <button type="button" onClick={() => confirmBooking(row.key)} className="font-body text-xs font-semibold text-orange underline underline-offset-2">
                              Mark Confirmed
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-navy/10 p-5">
          <p className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
            <Receipt size={13} /> Financial
          </p>
          {snapshot ? (
            <>
              <p className="mt-1 font-heading text-lg font-bold text-navy">{formatCurrency(snapshot.total)}</p>
              <p className="font-body text-sm text-text-grey">
                Version {snapshot.version} &middot; {formatCurrency(snapshot.pricingParticipantCount > 0 ? Math.round(snapshot.total / snapshot.pricingParticipantCount) : 0)} / participant
              </p>
            </>
          ) : (
            <p className="mt-1 font-body text-sm text-text-grey">No snapshot yet</p>
          )}
          <Link href={`/trips/${tripId}/cost`} className="mt-2 inline-flex items-center gap-1 font-body text-sm font-semibold text-orange underline underline-offset-2">
            Cost Console <ArrowRight size={12} />
          </Link>
        </div>

        <div className="rounded-2xl border border-navy/10 p-5">
          <p className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
            <CreditCard size={13} /> Payment
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-navy">
            {paymentStatus === "paid"
              ? "Paid"
              : paymentStatus === "partially_paid"
                ? "Partially Paid"
                : paymentStatus === "unlocked"
                  ? "Available"
                  : paymentStatus === "failed"
                    ? "Failed"
                    : paymentStatus === "pending"
                      ? "Processing"
                      : "Locked"}
          </p>
          <p className="font-body text-sm text-text-grey">
            {paymentStatus === "paid" ? "No balance due" : paymentStatus === "locked" ? "Awaiting verification" : totalPaid > 0 ? `${formatCurrency(paymentRemaining)} due` : "No payment made yet"}
          </p>
          {paymentStatus !== "locked" && (
            <Link href={`/trips/${tripId}/payment`} className="mt-2 inline-flex items-center gap-1 font-body text-sm font-semibold text-orange underline underline-offset-2">
              View Payment <ArrowRight size={12} />
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-navy/10 p-5">
          <p className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
            <Users size={13} /> Passenger Registration
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-navy">{stats.registered} / {stats.expected} registered</p>
          <p className="font-body text-sm text-text-grey">{stats.verified} verified &middot; {stats.needsCorrection} need attention</p>
          <Link href={`/trips/${tripId}/passengers`} className="mt-2 inline-flex items-center gap-1 font-body text-sm font-semibold text-orange underline underline-offset-2">
            Manage passengers <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-navy/10 p-5">
        <p className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
          <Sparkles size={13} /> Trip Readiness
        </p>
        <p className="mt-1 font-heading text-lg font-bold text-navy">{readiness.ready ? "Trip Ready" : `${readiness.unmet.length} item${readiness.unmet.length === 1 ? "" : "s"} remaining`}</p>
        {!readiness.ready && (
          <ul className="mt-1 flex flex-col gap-0.5">
            {readiness.unmet.map((u) => (
              <li key={u} className="font-body text-sm text-text-grey">
                {u}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
