"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { GROUP_TYPE_LABELS, GroupType, Template } from "@/lib/mock-templates";

const STEPS = ["Trip Basics", "Itinerary", "Review & Submit"];

export function TripBasicsForm({
  template,
  participants,
}: {
  template?: Template;
  participants?: string;
}) {
  const [tripName, setTripName] = useState(template?.name ?? "");
  const [destination, setDestination] = useState(template?.location ?? "");
  const [tripType, setTripType] = useState<GroupType>(
    template?.groupTypes[0] ?? "school"
  );
  const [durationDays, setDurationDays] = useState(
    template?.durationDays ?? 1
  );
  const [participantCount, setParticipantCount] = useState(
    Number(participants) || template?.suggestedParticipants || 1
  );

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Create a New Trip
        </h1>
        <div className="mt-4 flex items-center">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full font-body text-xs font-semibold",
                    index === 0
                      ? "bg-orange text-white"
                      : "bg-navy/10 text-text-grey"
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "font-body text-sm font-medium",
                    index === 0 ? "text-navy" : "text-text-grey"
                  )}
                >
                  {step}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <span className="mx-3 h-px w-8 bg-navy/10" />
              )}
            </div>
          ))}
        </div>
      </div>

      {template && (
        <div className="flex items-center gap-2 rounded-xl border border-mint/60 bg-mint/15 px-4 py-3">
          <CheckCircle2 size={18} className="shrink-0 text-navy" />
          <p className="font-body text-sm text-navy">
            Pre-filled from the{" "}
            <span className="font-semibold">{template.name}</span> template.
          </p>
        </div>
      )}

      <form className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white p-8">
        <Input
          label="Trip Name"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          placeholder="e.g. Western Ghats Expedition"
          required
        />
        <Input
          label="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Munnar, Kerala"
          required
        />

        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
              Trip Type
            </label>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value as GroupType)}
              className="rounded-md border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
            >
              {Object.entries(GROUP_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Duration (Days)"
            type="number"
            min={1}
            value={durationDays}
            onChange={(e) =>
              setDurationDays(Math.max(1, Number(e.target.value) || 1))
            }
          />
        </div>

        <Input
          label="Participants"
          type="number"
          min={1}
          value={participantCount}
          onChange={(e) =>
            setParticipantCount(Math.max(1, Number(e.target.value) || 1))
          }
        />

        <div className="mt-2 flex justify-end">
          <Link
            href="/trips/create/itinerary"
            className={buttonVariants({ variant: "accent", size: "lg" })}
          >
            Continue &rarr;
          </Link>
        </div>
      </form>
    </div>
  );
}
