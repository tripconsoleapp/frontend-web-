"use client";

import { formatCurrency } from "@/lib/mock-trips";
import type { PriceBreakdown } from "@/lib/hotel-booking-api";

function formatShortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export interface BookingSummaryProps {
  hotelName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  roomCount: number;
  roomName?: string;
  mealPlanLabel?: string;
  cancellationLabel?: string;
  pricing?: PriceBreakdown;
  /** Compact mode drops the price breakdown lines — used on screens before
   *  a room has been chosen yet. */
  compact?: boolean;
}

export function BookingSummary({
  hotelName,
  location,
  checkIn,
  checkOut,
  nights,
  adults,
  children,
  roomCount,
  roomName,
  mealPlanLabel,
  cancellationLabel,
  pricing,
  compact,
}: BookingSummaryProps) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Your stay</p>
      <p className="mt-1 font-heading text-base font-semibold text-navy">{hotelName}</p>
      <p className="font-body text-xs text-text-grey">{location}</p>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-navy/10 pt-4 font-body text-sm text-navy">
        <div className="flex items-center justify-between">
          <span className="text-text-grey">Dates</span>
          <span>
            {formatShortDate(checkIn)} &ndash; {formatShortDate(checkOut)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-grey">Nights</span>
          <span>{nights}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-grey">Guests</span>
          <span>
            {adults} Adult{adults === 1 ? "" : "s"}
            {children > 0 ? ` · ${children} Child${children === 1 ? "" : "ren"}` : ""}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-grey">Rooms</span>
          <span>{roomCount}</span>
        </div>
        {roomName && (
          <div className="flex items-center justify-between">
            <span className="text-text-grey">Room</span>
            <span className="text-right">{roomName}</span>
          </div>
        )}
        {mealPlanLabel && (
          <div className="flex items-center justify-between">
            <span className="text-text-grey">Meal plan</span>
            <span>{mealPlanLabel}</span>
          </div>
        )}
      </div>

      {cancellationLabel && (
        <div className="mt-4 rounded-xl bg-mint/20 px-3 py-2.5">
          <p className="font-body text-xs font-medium text-navy">{cancellationLabel}</p>
        </div>
      )}

      {!compact && pricing && (
        <div className="mt-4 flex flex-col gap-1.5 border-t border-navy/10 pt-4 font-body text-sm text-navy">
          <div className="flex items-center justify-between">
            <span className="text-text-grey">
              {formatCurrency(pricing.pricePerNight)} &times; {pricing.nights} nights &times; {pricing.roomCount} room
              {pricing.roomCount === 1 ? "" : "s"}
            </span>
            <span>{formatCurrency(pricing.baseAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-grey">Taxes</span>
            <span>{formatCurrency(pricing.taxes)}</span>
          </div>
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
