"use client";

import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/mock-trips";
import type { HotelSearchResult } from "@/lib/hotel-booking-api";

export function HotelCard({ result, onView }: { result: HotelSearchResult; onView: () => void }) {
  const { hotel, fromPricePerNight, totalForStay, nights, hasFreeCancellation } = result;

  return (
    <button
      type="button"
      onClick={onView}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white text-left transition-shadow hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={hotel.images[0]}
          alt=""
          fill
          sizes="(min-width: 1024px) 380px, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hasFreeCancellation && (
          <span className="absolute left-3 top-3">
            <Badge variant="mint">Free cancellation</Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-heading text-base font-semibold text-navy">{hotel.name}</p>
            <p className="mt-0.5 flex items-center gap-1 font-body text-xs text-text-grey">
              <MapPin size={12} /> {hotel.location}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-navy/5 px-2 py-1">
            <Star size={12} className="fill-orange text-orange" />
            <span className="font-body text-xs font-semibold text-navy">{hotel.guestRating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {hotel.amenities.slice(0, 3).map((a) => (
            <span key={a} className="rounded-full bg-navy/[0.04] px-2.5 py-1 font-body text-[11px] text-navy/80">
              {a}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="font-body text-xs text-text-grey">
              From <span className="font-semibold text-navy">{formatCurrency(fromPricePerNight)}</span> / night
            </p>
            {nights > 0 && (
              <p className="font-body text-xs text-text-grey">
                {formatCurrency(totalForStay)} total for {nights} {nights === 1 ? "night" : "nights"}
              </p>
            )}
          </div>
          <span className="font-body text-xs font-semibold text-orange">View Hotel &rarr;</span>
        </div>
      </div>
    </button>
  );
}
