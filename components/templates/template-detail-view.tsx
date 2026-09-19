"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PhotoPanel } from "@/components/ui/photo-panel";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import {
  DESTINATION_TYPE_LABELS,
  GROUP_TYPE_LABELS,
  Template,
} from "@/lib/mock-templates";
import { ServiceIcon } from "@/components/templates/service-icon";

export function TemplateDetailView({ template }: { template: Template }) {
  const [activeDay, setActiveDay] = useState(template.itinerary[0].day);
  const [participants, setParticipants] = useState(
    template.suggestedParticipants
  );

  const activeDayData =
    template.itinerary.find((day) => day.day === activeDay) ??
    template.itinerary[0];

  const subtotal = template.pricePerPerson * participants;
  const total = subtotal + template.groupServiceFee;

  return (
    <div className="flex flex-col gap-8 pb-28">
      <div>
        <PhotoPanel className="h-64 w-full rounded-2xl" />

        <div className="mt-5 flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {template.destinationTypes.map((type) => (
              <Badge key={type} variant="mint">
                {DESTINATION_TYPE_LABELS[type]}
              </Badge>
            ))}
            {template.groupTypes.map((type) => (
              <Badge key={type} variant="navy-outline">
                {GROUP_TYPE_LABELS[type]}
              </Badge>
            ))}
          </div>

          <h1 className="font-heading text-2xl font-bold text-navy">
            {template.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 font-body text-sm text-text-grey">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {template.location}
            </span>
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-amber-500 text-amber-500" />
              {template.rating.toFixed(1)} ({template.reviews} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-navy/10 bg-white p-6 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
            <Calendar size={18} />
          </span>
          <div>
            <p className="font-body text-xs text-text-grey">Duration</p>
            <p className="font-heading text-sm font-semibold text-navy">
              {template.durationLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
            <Users size={18} />
          </span>
          <div>
            <p className="font-body text-xs text-text-grey">Group Type</p>
            <p className="font-heading text-sm font-semibold text-navy">
              {template.groupTypes.map((t) => GROUP_TYPE_LABELS[t]).join(", ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
            <span className="font-heading text-sm font-bold">₹</span>
          </span>
          <div>
            <p className="font-body text-xs text-text-grey">Price Range</p>
            <p className="font-heading text-sm font-semibold text-navy">
              {formatCurrency(template.pricePerPerson)}/student
            </p>
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-heading text-lg font-semibold text-navy">
          About this template
        </h2>
        <p className="mt-2 max-w-3xl font-body text-sm leading-relaxed text-text-grey">
          {template.about}
        </p>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-navy">
          Highlights
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {template.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-2 font-body text-sm text-text-grey"
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-mint/40 text-navy">
                <svg viewBox="0 0 10 10" className="h-2 w-2" fill="currentColor">
                  <circle cx="5" cy="5" r="5" />
                </svg>
              </span>
              {highlight}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-navy">
          Itinerary
        </h2>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {template.itinerary.map((day) => (
            <button
              key={day.day}
              type="button"
              onClick={() => setActiveDay(day.day)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 font-body text-sm font-medium",
                activeDay === day.day
                  ? "bg-orange text-white"
                  : "bg-navy/5 text-navy"
              )}
            >
              Day {day.day}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-navy/10 bg-white p-6">
          <h3 className="font-heading text-sm font-semibold text-navy">
            {activeDayData.title}
          </h3>
          <div className="mt-3 flex flex-col gap-3">
            {activeDayData.activities.map((activity, index) => (
              <div key={index} className="flex gap-4">
                <span className="w-20 shrink-0 font-body text-xs font-semibold text-text-grey">
                  {activity.time}
                </span>
                <span className="font-body text-sm text-navy">
                  {activity.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-navy">
          Included Services
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {template.includedServices.map((service) => (
            <div
              key={service}
              className="flex items-center gap-2 rounded-xl border border-navy/10 bg-white p-3"
            >
              <ServiceIcon service={service} />
              <span className="font-body text-sm text-navy">{service}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-navy/10 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold text-navy">
          Group Summary
        </h2>

        <div className="mt-4 flex items-center justify-between">
          <label
            htmlFor="participants"
            className="font-body text-sm text-text-grey"
          >
            Participants
          </label>
          <input
            id="participants"
            type="number"
            min={1}
            value={participants}
            onChange={(e) =>
              setParticipants(Math.max(1, Number(e.target.value) || 1))
            }
            className="w-24 rounded-md border border-navy/15 px-3 py-1.5 text-right font-body text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-navy/10 pt-4 font-body text-sm">
          <div className="flex justify-between text-text-grey">
            <span>
              {participants} participants &times;{" "}
              {formatCurrency(template.pricePerPerson)}
            </span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {template.groupServiceFee > 0 && (
            <div className="flex justify-between text-text-grey">
              <span>Group service fee</span>
              <span>{formatCurrency(template.groupServiceFee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-navy/10 pt-2 font-heading text-base font-semibold text-navy">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-xs text-text-grey">Total</p>
            <p className="font-heading text-lg font-bold text-navy">
              {formatCurrency(total)}
            </p>
          </div>
          <Link
            href={`/trips/create/loading?template=${template.id}&participants=${participants}`}
            className={buttonVariants({ variant: "accent", size: "lg" })}
          >
            Use This Template
          </Link>
        </div>
      </div>
    </div>
  );
}
