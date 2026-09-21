"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Check, MapPin, Star, X } from "lucide-react";
import { Activity } from "@/lib/mock-activity-catalog";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { fitsGroup } from "@/lib/activity-plan";
import { ActivityContextHeader } from "./activity-context-header";

export function ActivityDetail({
  destinationId,
  activity,
  template,
}: {
  destinationId: string;
  activity: Activity;
  template?: string;
}) {
  const router = useRouter();
  const trip = useTripContext();
  const templateQuery = template ? `?template=${template}` : "";

  const [activeImage, setActiveImage] = useState(activity.heroImage);
  const fits = fitsGroup(activity.capacity, trip.passengerCount);
  const thumbnails = [activity.heroImage, ...activity.galleryImages];
  const destinationName = trip.stops.find((s) => s.id === destinationId)?.name;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ActivityContextHeader
        backHref={`/trips/create/services/activities/${destinationId}/discover${templateQuery}`}
        backLabel="Back to results"
        eyebrow="Activity"
        destinationName={destinationName}
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <div className="relative col-span-1 row-span-2 h-64 overflow-hidden rounded-2xl sm:col-span-3 sm:h-[380px]">
          <Image src={activeImage} alt={activity.name} fill sizes="(min-width: 640px) 70vw, 100vw" className="object-cover" priority />
        </div>
        {thumbnails.length > 1 &&
          thumbnails.slice(0, 2).map((img, i) => (
            <button key={i} type="button" onClick={() => setActiveImage(img)} className="relative hidden h-[186px] overflow-hidden rounded-2xl sm:block">
              <Image src={img} alt="" fill sizes="25vw" className="object-cover transition-transform duration-300 hover:scale-105" />
              {img === activeImage && <span className="absolute inset-0 ring-2 ring-inset ring-orange" />}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div>
            <span className="rounded-full bg-navy/5 px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-navy">
              {activity.category}
            </span>
            <h1 className="mt-2 font-heading text-2xl font-bold text-navy">{activity.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-text-grey">
              <MapPin size={13} /> {activity.location}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 font-body text-sm text-navy">
              <span className="flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-white">
                <Star size={12} className="fill-white" /> {activity.rating}
              </span>
              <span className="text-text-grey">{activity.reviewCount} reviews</span>
              <span className="text-navy/20">&middot;</span>
              <span>{activity.durationHours} {activity.durationHours === 1 ? "hour" : "hours"}</span>
              {activity.difficulty && (
                <>
                  <span className="text-navy/20">&middot;</span>
                  <span>{activity.difficulty}</span>
                </>
              )}
            </div>
          </div>

          <p className="font-body text-base leading-relaxed text-navy/80">{activity.description}</p>

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">Highlights</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {activity.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 font-body text-sm text-navy/80">
                  <Check size={14} className="mt-0.5 shrink-0 text-mint" /> {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h2 className="font-heading text-base font-semibold text-navy">What&rsquo;s included</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {activity.included.map((h) => (
                  <li key={h} className="flex items-start gap-2 font-body text-sm text-navy/80">
                    <Check size={14} className="mt-0.5 shrink-0 text-mint" /> {h}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-navy">Not included</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {activity.excluded.map((h) => (
                  <li key={h} className="flex items-start gap-2 font-body text-sm text-navy/80">
                    <X size={14} className="mt-0.5 shrink-0 text-text-grey" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">Meeting point</h2>
            <p className="mt-2 font-body text-sm text-navy/80">{activity.meetingPoint}</p>
          </div>

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">Cancellation</h2>
            <p className="mt-2 font-body text-sm text-navy/80">{activity.cancellationPolicy}</p>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">From</p>
            <p className="font-heading text-2xl font-bold text-navy">
              {formatCurrency(activity.unitPrice)}{" "}
              <span className="font-body text-sm font-normal text-text-grey">
                {activity.pricingType === "per_person" ? "/ person" : "/ group"}
              </span>
            </p>
            <p className={fits ? "mt-2 flex items-center gap-1.5 font-body text-sm font-medium text-navy" : "mt-2 flex items-center gap-1.5 font-body text-sm font-medium text-orange"}>
              {fits ? (
                <>
                  <Check size={14} /> Fits your {trip.passengerCount}-guest group
                </>
              ) : (
                `Capacity ${activity.capacity} — your group of ${trip.passengerCount} won’t fit in one booking`
              )}
            </p>
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/trips/create/services/activities/${destinationId}/activity/${activity.id}/configure${templateQuery}`)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
            >
              Check Availability <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
