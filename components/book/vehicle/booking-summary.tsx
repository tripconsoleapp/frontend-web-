"use client";

import { formatCurrency } from "@/lib/mock-trips";
import type { PriceBreakdown } from "@/lib/vehicle-booking-api";

function formatShortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export interface VehicleBookingSummaryProps {
  pickupLabel: string;
  dropLabel: string;
  journeyDate: string;
  pickupTime: string;
  isRoundTrip: boolean;
  returnDate?: string;
  passengers: number;
  /** Mode-specific selection summary — a vehicle combination list or a
   *  KSRTC service line, rendered by the caller so this component never
   *  needs to know the two shapes. */
  selectionSummary?: React.ReactNode;
  cancellationLabel?: string;
  pricing?: PriceBreakdown;
  compact?: boolean;
}

export function VehicleBookingSummary({
  pickupLabel,
  dropLabel,
  journeyDate,
  pickupTime,
  isRoundTrip,
  returnDate,
  passengers,
  selectionSummary,
  cancellationLabel,
  pricing,
  compact,
}: VehicleBookingSummaryProps) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Your journey</p>
      <p className="mt-1 font-heading text-base font-semibold text-navy">
        {pickupLabel} &rarr; {dropLabel}
      </p>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-navy/10 pt-4 font-body text-sm text-navy">
        <div className="flex items-center justify-between">
          <span className="text-text-grey">Journey date</span>
          <span>
            {formatShortDate(journeyDate)} &middot; {pickupTime}
          </span>
        </div>
        {isRoundTrip && returnDate && (
          <div className="flex items-center justify-between">
            <span className="text-text-grey">Return date</span>
            <span>{formatShortDate(returnDate)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-text-grey">Passengers</span>
          <span>{passengers}</span>
        </div>
      </div>

      {selectionSummary && <div className="mt-4 border-t border-navy/10 pt-4">{selectionSummary}</div>}

      {cancellationLabel && (
        <div className="mt-4 rounded-xl bg-mint/20 px-3 py-2.5">
          <p className="font-body text-xs font-medium text-navy">{cancellationLabel}</p>
        </div>
      )}

      {!compact && pricing && (
        <div className="mt-4 flex flex-col gap-1.5 border-t border-navy/10 pt-4 font-body text-sm text-navy">
          {pricing.lineItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="text-text-grey">{item.label}</span>
              <span className="shrink-0">{formatCurrency(item.amount)}</span>
            </div>
          ))}
          {pricing.taxes > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-text-grey">Taxes</span>
              <span>{formatCurrency(pricing.taxes)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-text-grey">Mandatory fees</span>
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
