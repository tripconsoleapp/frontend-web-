"use client";

import Image from "next/image";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Restaurant } from "@/lib/restaurant-booking-data";

export function RestaurantCard({ restaurant, onSelect }: { restaurant: Restaurant; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-40 w-full overflow-hidden">
        <Image src={restaurant.heroImage} alt={restaurant.name} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-body text-[10px] font-semibold text-navy backdrop-blur-sm">
          {restaurant.priceTier}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold text-navy">{restaurant.name}</h3>
          <span className="flex shrink-0 items-center gap-1 font-body text-sm text-navy">
            <Star size={13} className="fill-orange text-orange" /> {restaurant.rating}
          </span>
        </div>
        <p className="font-body text-xs text-text-grey">{restaurant.cuisine}</p>
        <p className="font-body text-xs text-text-grey">
          {restaurant.reviewCount.toLocaleString("en-IN")} reviews &middot; {restaurant.locationLabel}
        </p>
        <span
          className={cn(
            "mt-1 flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-medium",
            restaurant.dietType === "veg" ? "bg-mint/30 text-navy" : "bg-navy/5 text-navy"
          )}
        >
          <Check size={12} /> {restaurant.dietType === "veg" ? "Pure Veg" : "Veg + Non-Veg"}
        </span>
      </div>
    </button>
  );
}
