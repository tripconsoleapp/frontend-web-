"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock, Download, FileText, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { MEAL_LABELS } from "@/lib/meal-plan";
import { useTripContext } from "@/lib/use-trip-context";
import { ServicesDraft, TripRecord, getItineraryDraft, getServicesDraft, getTripRecord, ItineraryDraft } from "@/lib/listing-draft";
import { currentCostSnapshot, maskIdNumber, totalPaidAmount } from "@/lib/trip-operations";

type DocStatus = "ready" | "pending" | "unavailable";

interface DocDef {
  id: string;
  name: string;
  description: string;
  status: DocStatus;
  reason?: string;
  generate?: () => string;
}

export function DocumentCenter({ tripId }: { tripId: string }) {
  const trip = useTripContext();
  const [record, setRecord] = useState<TripRecord | null>(null);
  const [services, setServices] = useState<ServicesDraft | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryDraft | null>(null);

  useEffect(() => {
    setRecord(getTripRecord());
    setServices(getServicesDraft());
    setItinerary(getItineraryDraft());
  }, []);

  if (!record || !services || !itinerary) {
    return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;
  }

  if (record.id !== tripId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This trip couldn&rsquo;t be found.</p>
        <Link href="/trips" className="font-body text-sm font-semibold text-orange underline underline-offset-2">Back to My Trips</Link>
      </div>
    );
  }

  const snapshot = currentCostSnapshot(record.costSnapshots);
  const totalPaid = totalPaidAmount(record.payment.attempts);
  const travelers = record.passengerManagement.travelers;

  function download(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const docs: DocDef[] = [
    {
      id: "summary",
      name: "Trip Summary",
      description: "Trip identity, dates, travelers, and current status.",
      status: record.status !== "draft" ? "ready" : "unavailable",
      reason: "Available once the trip has been submitted.",
      generate: () =>
        [
          `TRIP SUMMARY — ${record.reference ?? ""}`,
          `Trip: ${trip.tripName}`,
          `Dates: ${trip.dateRangeLabel}`,
          `Route: ${trip.routeLabel}`,
          `Travelers: ${trip.passengerCount}`,
          `Status: ${record.status}`,
        ].join("\n"),
    },
    {
      id: "route",
      name: "Route & Map Overview",
      description: "Destinations and stop order.",
      status: trip.stops.length > 0 ? "ready" : "unavailable",
      reason: "Available once destinations are configured.",
      generate: () => [`ROUTE OVERVIEW`, `Start: ${trip.startLocationName}`, ...trip.stops.map((s, i) => `${i + 1}. ${s.name} — ${s.nights} night${s.nights === 1 ? "" : "s"}`)].join("\n"),
    },
    {
      id: "itinerary",
      name: "Day-wise Itinerary",
      description: "The full generated day-by-day plan.",
      status: itinerary.status === "ready" ? "ready" : "unavailable",
      reason: "Available once the itinerary has been finalized.",
      generate: () =>
        itinerary.days
          .map((d) => [`DAY ${d.dayIndex} — ${d.destinationName} (${d.date})`, ...d.blocks.map((b) => `  ${b.startTime}-${b.endTime}  ${b.title}`)].join("\n"))
          .join("\n\n"),
    },
    {
      id: "cost",
      name: "Cost Breakdown Report",
      description: "The approved cost snapshot, itemized by service.",
      status: snapshot ? "ready" : "unavailable",
      reason: "Available once a cost snapshot has been locked.",
      generate: () =>
        snapshot
          ? [
              `COST BREAKDOWN — Snapshot v${snapshot.version}`,
              `Transport: ${formatCurrency(snapshot.items.vehicle)}`,
              `Accommodation: ${formatCurrency(snapshot.items.hotel)}`,
              `Meals: ${formatCurrency(snapshot.items.dining)}`,
              `Activities: ${formatCurrency(snapshot.items.activities)}`,
              `Total: ${formatCurrency(snapshot.total)}`,
              `Pricing basis: ${snapshot.pricingParticipantCount} participants`,
            ].join("\n")
          : "",
    },
    {
      id: "manifest",
      name: "Passenger Manifest",
      description: "Registered traveler list with masked ID numbers.",
      status: travelers.length > 0 ? "ready" : "unavailable",
      reason: "Available once travelers have started registering.",
      generate: () =>
        [`PASSENGER MANIFEST — ${record.reference ?? ""}`, `${travelers.length} of ${trip.passengerCount} registered`, "", ...travelers.map((t) => `${t.name} — ${t.travelerType} — ${maskIdNumber(t.idType, t.idNumber)} — ${t.registrationStatus}`)].join(
          "\n"
        ),
    },
    {
      id: "receipt",
      name: "Payment Receipt",
      description: "A record of every successful payment made toward this trip.",
      status: totalPaid > 0 ? "ready" : "unavailable",
      reason: "Available after your first successful payment.",
      generate: () =>
        [
          `PAYMENT RECEIPT — ${record.reference ?? ""}`,
          `Trip: ${trip.tripName}`,
          `Total Paid: ${formatCurrency(totalPaid)}`,
          "",
          ...record.payment.attempts
            .filter((a) => a.status === "succeeded")
            .map((a) => `${a.type} — ${formatCurrency(a.amount)} — ${a.methodLabel} — ${a.transactionId} — ${new Date(a.createdAt).toLocaleDateString("en-IN")}`),
        ].join("\n"),
    },
    {
      id: "meals",
      name: "Meal Summary",
      description: "Confirmed meal bookings by day.",
      status: services.restaurant.configured && services.restaurant.meals.some((m) => m.status === "confirmed") ? "ready" : "unavailable",
      reason: "Available once meals are confirmed.",
      generate: () =>
        services.restaurant.meals
          .filter((m) => m.status === "confirmed")
          .map((m) => `Day ${m.dayIndex} — ${MEAL_LABELS[m.mealType]} — ${m.restaurant?.name ?? ""} — ${formatCurrency(m.total)}`)
          .join("\n"),
    },
    {
      id: "operator-contact",
      name: "Operator Contact Sheet",
      description: "Assigned operator and coordination contact.",
      status: "unavailable",
      reason: "Operator contact details are not yet available in this build.",
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Link href={`/trips/${tripId}/operations`} className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
        <ArrowLeft size={14} /> Back to operations
      </Link>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">{record.reference}</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Trip Documents</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Generated from this trip&rsquo;s actual data — nothing here is a placeholder.</p>
      </div>

      <div className="flex flex-col divide-y divide-navy/10 rounded-2xl border border-navy/10">
        {docs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  doc.status === "ready" ? "bg-mint/40 text-navy" : doc.status === "pending" ? "bg-orange/10 text-orange" : "bg-navy/[0.05] text-text-grey"
                )}
              >
                {doc.status === "ready" ? <Check size={14} /> : doc.status === "pending" ? <Clock size={14} /> : <Minus size={14} />}
              </span>
              <div>
                <p className="font-body text-sm font-semibold text-navy">{doc.name}</p>
                <p className="font-body text-xs text-text-grey">{doc.status === "unavailable" ? doc.reason : doc.description}</p>
              </div>
            </div>
            {doc.status === "ready" && doc.generate ? (
              <button
                type="button"
                onClick={() => download(`${doc.id}-${record.reference ?? tripId}.txt`, doc.generate!())}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-navy/20 px-3.5 py-1.5 font-body text-xs font-semibold text-navy transition-colors hover:bg-navy/5"
              >
                <Download size={12} /> Download
              </button>
            ) : (
              <span className="shrink-0 font-body text-xs font-medium text-text-grey">{doc.status === "pending" ? "Pending" : "Unavailable"}</span>
            )}
          </div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 font-body text-xs text-text-grey">
        <FileText size={12} /> Documents download as plain-text summaries in this build — not formatted PDFs.
      </p>
    </div>
  );
}
