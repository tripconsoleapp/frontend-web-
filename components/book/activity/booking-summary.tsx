"use client";

import { formatCurrency } from "@/lib/mock-trips";
import type { PriceBreakdown } from "@/lib/activity-booking-api";

function formatShortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export interface ActivityBookingSummaryProps {
  activityName: string;
  location: string;
  date: string;
  time: string;
  participants: number;
  selectionSummary?: React.ReactNode;
  pricing?: PriceBreakdown;
  compact?: boolean;
}

export function ActivityBookingSummary({
  activityName,
  location,
  date,
  time,
  participants,
  selectionSummary,
  pricing,
  compact,
}: ActivityBookingSummaryProps) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Your booking</p>
      <p className="mt-1 font-heading text-base font-semibold text-navy">{activityName}</p>
      <p className="font-body text-xs text-text-grey">{location}</p>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-navy/10 pt-4 font-body text-sm text-navy">
        <div className="flex items-center justify-between">
          <span className="text-text-grey">Date &amp; time</span>
          <span>
            {formatShortDate(date)} &middot; {time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-grey">Participants</span>
          <span>{participants}</span>
        </div>
      </div>

      {selectionSummary && <div className="mt-4 border-t border-navy/10 pt-4">{selectionSummary}</div>}

      {!compact && pricing && (
        <div className="mt-4 flex flex-col gap-1.5 border-t border-navy/10 pt-4 font-body text-sm text-navy">
          {pricing.lineItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="text-text-grey">{item.label}</span>
              <span className="shrink-0">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-text-grey">GST (18%, simulated)</span>
            <span>{formatCurrency(pricing.taxes)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-grey">Booking fee (3%, simulated)</span>
            <span>{formatCurrency(pricing.mandatoryFees)}</span>
          </div>
          {pricing.discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-text-grey">Discount</span>
              <span className="text-navy">&ndash;{formatCurrency(pricing.discount)}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-navy/10 pt-3">
            <span className="font-semibold text-navy">Total Payable</span>
            <span className="font-heading text-lg font-bold text-navy">{formatCurrency(pricing.totalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
