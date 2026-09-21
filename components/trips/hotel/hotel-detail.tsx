"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Hotel } from "@/lib/mock-hotel-catalog";
import { formatCurrency } from "@/lib/mock-trips";
import { HotelContextHeader } from "./hotel-context-header";
import { getServicesDraft } from "@/lib/listing-draft";

export function HotelDetail({
  destinationId,
  hotel,
  template,
}: {
  destinationId: string;
  hotel: Hotel;
  template?: string;
}) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(hotel.heroImage);
  const templateQuery = template ? `?template=${template}` : "";
  const stay = getServicesDraft().hotel.stays.find((s) => s.destinationId === destinationId);
  const cheapestPrice = Math.min(...hotel.rooms.map((r) => r.pricePerNight));
  const thumbnails = [hotel.heroImage, ...hotel.galleryImages];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <HotelContextHeader
        backHref={`/trips/create/services/hotel/${destinationId}/results${templateQuery}`}
        backLabel="Back to results"
        eyebrow="Select Hotels"
        stay={stay ? { destinationName: stay.destinationName, checkIn: stay.checkIn, checkOut: stay.checkOut, nights: stay.nights } : undefined}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <div className="relative col-span-1 row-span-2 h-64 overflow-hidden rounded-2xl sm:col-span-3 sm:h-[380px]">
          <Image src={activeImage} alt={hotel.name} fill sizes="(min-width: 640px) 70vw, 100vw" className="object-cover" priority />
        </div>
        {thumbnails.length > 1 &&
          thumbnails.slice(0, 2).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImage(img)}
              className="relative hidden h-[186px] overflow-hidden rounded-2xl sm:block"
            >
              <Image src={img} alt="" fill sizes="25vw" className="object-cover transition-transform duration-300 hover:scale-105" />
              {img === activeImage && <span className="absolute inset-0 ring-2 ring-inset ring-orange" />}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div>
            <span className="rounded-full bg-navy/5 px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-navy">
              {hotel.propertyType}
            </span>
            <h1 className="mt-2 font-heading text-2xl font-bold text-navy">{hotel.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-text-grey">
              <MapPin size={13} /> {hotel.locationLabel}
            </p>
            <div className="mt-2 flex items-center gap-2 font-body text-sm text-navy">
              <span className="flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-white">
                <Star size={12} className="fill-white" /> {hotel.rating}
              </span>
              <span className="font-medium">{hotel.ratingLabel}</span>
              <span className="text-text-grey">&middot; {hotel.reviewCount} reviews</span>
            </div>
          </div>

          <p className="font-body text-base leading-relaxed text-navy/80">{hotel.description}</p>

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">Amenities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {hotel.amenities.map((a) => (
                <span key={a} className="rounded-full bg-navy/[0.04] px-3 py-1.5 font-body text-sm text-navy">
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">Ratings breakdown</h2>
            <div className="mt-3 grid grid-cols-3 gap-4">
              {(["cleanliness", "location", "service"] as const).map((k) => (
                <div key={k} className="rounded-xl bg-navy/[0.03] px-4 py-3 text-center">
                  <p className="font-heading text-lg font-bold text-navy">{hotel.ratingBreakdown[k]}</p>
                  <p className="font-body text-xs capitalize text-text-grey">{k}</p>
                </div>
              ))}
            </div>
          </div>

          {hotel.reviews.length > 0 && (
            <div>
              <h2 className="font-heading text-base font-semibold text-navy">Guest reviews</h2>
              <div className="mt-3 flex flex-col gap-3">
                {hotel.reviews.map((r, i) => (
                  <div key={i} className="rounded-xl bg-navy/[0.03] px-4 py-3">
                    <p className="font-body text-sm font-semibold text-navy">
                      {r.author} <span className="font-normal text-text-grey">&middot; {r.date}</span>
                    </p>
                    <p className="mt-1 font-body text-sm text-navy/80">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">Rooms</h2>
            <div className="mt-3 flex flex-col gap-2">
              {hotel.rooms.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-navy/10 px-4 py-3">
                  <div>
                    <p className="font-body text-sm font-semibold text-navy">{r.name}</p>
                    <p className="font-body text-xs text-text-grey">Sleeps {r.sleeps} &middot; {r.beds}</p>
                  </div>
                  <p className="font-body text-sm font-semibold text-navy">{formatCurrency(r.pricePerNight)}/night</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">From</p>
            <p className="font-heading text-2xl font-bold text-navy">
              {formatCurrency(cheapestPrice)} <span className="font-body text-sm font-normal text-text-grey">/ night</span>
            </p>
            {stay && (
              <p className="mt-1 font-body text-sm text-text-grey">
                {stay.destinationName} &middot; {stay.nights === 1 ? "1 night" : `${stay.nights} nights`}
              </p>
            )}
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/trips/create/services/hotel/${destinationId}/${hotel.id}/rooms${templateQuery}`)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
            >
              View Rooms &amp; Book <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
