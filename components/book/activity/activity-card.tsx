"use client";

import Image from "next/image";
import { Clock, Star } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import type { Activity } from "@/lib/activity-booking-data";

function fromPrice(activity: Activity): number {
  return Math.min(...activity.ticketTypes.map((t) => t.price));
}

export function ActivityCard({ activity, onSelect }: { activity: Activity; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-40 w-full overflow-hidden">
        <Image src={activity.heroImage} alt={activity.name} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-body text-[10px] font-semibold text-navy backdrop-blur-sm">
          {activity.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-navy">{activity.name}</h3>
          <span className="flex shrink-0 items-center gap-1 font-body text-sm text-navy">
            <Star size={13} className="fill-orange text-orange" /> {activity.rating}
          </span>
        </div>
        <p className="font-body text-xs text-text-grey">{activity.location}</p>
        <p className="flex items-center gap-1.5 font-body text-xs text-text-grey">
          <Clock size={12} /> {activity.durationHours} {activity.durationHours === 1 ? "hour" : "hours"} &middot; {activity.reviewCount.toLocaleString("en-IN")} reviews
        </p>
        <p className="mt-auto border-t border-navy/10 pt-3 font-body text-sm font-semibold text-navy">From {formatCurrency(fromPrice(activity))}</p>
      </div>
    </button>
  );
}
