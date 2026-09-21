"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { Activity } from "@/lib/mock-activity-catalog";
import { ScheduledActivity, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { computeStayDates, formatStayDate } from "@/lib/hotel-stays";
import { fitsGroup, findScheduleConflicts, generateScheduledActivityId } from "@/lib/activity-plan";
import { CounterInput } from "@/components/ui/counter-input";
import { ActivityContextHeader } from "./activity-context-header";

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const nm = ((total % 60) + 60) % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function ActivityConfigure({
  destinationId,
  activity,
  template,
}: {
  destinationId: string;
  activity: Activity;
  template?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const trip = useTripContext();
  const templateQuery = template ? `?template=${template}` : "";

  const stayDates = trip.ready ? computeStayDates(trip.stops, trip.startDate).find((d) => d.destinationId === destinationId) : undefined;

  const [date, setDate] = useState(stayDates?.checkIn ?? "");
  const [startTime, setStartTime] = useState(activity.timesAvailable[0] ?? "09:00");
  const [participants, setParticipants] = useState(1);
  const [addAnyway, setAddAnyway] = useState(false);
  const [loadedExisting, setLoadedExisting] = useState(!editId);

  // useTripContext() starts empty (passengerCount 0) until its own
  // post-mount effect resolves, so seeding `participants` from it in the
  // useState initializer above would freeze it at 1 forever. Apply the
  // real group size once, only for a brand-new (non-edit) configuration.
  useEffect(() => {
    if (!editId && trip.ready && trip.passengerCount > 0) setParticipants(trip.passengerCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.ready]);

  useEffect(() => {
    if (!editId || !trip.ready) return;
    const draft = getServicesDraft();
    const dest = draft.activities.destinations.find((d) => d.destinationId === destinationId);
    const existing = dest?.activities.find((a) => a.id === editId);
    if (existing) {
      setDate(existing.date);
      setStartTime(existing.startTime);
      setParticipants(existing.participants);
    }
    setLoadedExisting(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, trip.ready]);

  useEffect(() => {
    if (stayDates && !date) setDate(stayDates.checkIn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stayDates]);

  const endTime = addMinutes(startTime, Math.round(activity.durationHours * 60));
  const fits = fitsGroup(activity.capacity, participants);
  const total = activity.pricingType === "per_person" ? activity.unitPrice * participants : activity.unitPrice;

  const conflicts = useMemo(() => {
    if (!date || !loadedExisting) return [];
    const draft = getServicesDraft();
    const dest = draft.activities.destinations.find((d) => d.destinationId === destinationId);
    return findScheduleConflicts(
      { date, startTime, endTime },
      dest?.activities ?? [],
      editId,
      draft.restaurant.meals,
      trip.stops,
      trip.startDate
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, startTime, endTime, destinationId, editId, loadedExisting, trip.stops, trip.startDate]);

  const dateOptions = useMemo(() => {
    if (!stayDates) return [];
    const options: string[] = [];
    let cursor = stayDates.checkIn;
    while (cursor < stayDates.checkOut) {
      options.push(cursor);
      const d = new Date(cursor);
      d.setDate(d.getDate() + 1);
      cursor = d.toISOString().slice(0, 10);
    }
    return options.length > 0 ? options : [stayDates.checkIn];
  }, [stayDates]);

  function handleAdd() {
    if (!fits || (conflicts.length > 0 && !addAnyway)) return;
    const draft = getServicesDraft();
    const destinations = draft.activities.destinations;
    const dest = destinations.find((d) => d.destinationId === destinationId);
    const item: ScheduledActivity = {
      id: editId ?? generateScheduledActivityId(),
      activityId: activity.id,
      name: activity.name,
      imageUrl: activity.heroImage,
      date,
      startTime,
      endTime,
      durationHours: activity.durationHours,
      participants,
      pricingType: activity.pricingType,
      unitPrice: activity.unitPrice,
      total,
    };
    const nextActivities = dest
      ? editId
        ? dest.activities.map((a) => (a.id === editId ? item : a))
        : [...dest.activities, item]
      : [item];
    const nextDestinations = destinations.some((d) => d.destinationId === destinationId)
      ? destinations.map((d) =>
          d.destinationId === destinationId ? { ...d, status: "has_activities" as const, activities: nextActivities } : d
        )
      : [...destinations, { destinationId, destinationName: stayDates ? trip.stops.find((s) => s.id === destinationId)?.name ?? destinationId : destinationId, status: "has_activities" as const, activities: nextActivities }];
    saveServicesDraft({ ...draft, activities: { ...draft.activities, destinations: nextDestinations } });
    router.push(`/trips/create/services/activities/${destinationId}/plan${templateQuery}`);
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ActivityContextHeader
        backHref={`/trips/create/services/activities/${destinationId}/activity/${activity.id}${templateQuery}`}
        backLabel="Back to activity"
        eyebrow="Configure"
        destinationName={trip.stops.find((s) => s.id === destinationId)?.name}
      />

      <div>
        <h1 className="font-heading text-xl font-bold text-navy">{activity.name}</h1>
        <p className="mt-0.5 font-body text-sm text-text-grey">{activity.durationHours} {activity.durationHours === 1 ? "hour" : "hours"}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Date</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {dateOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={cn(
                    "rounded-full border px-4 py-2 font-body text-sm font-medium transition-colors",
                    date === d ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                  )}
                >
                  {formatStayDate(d)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Start time</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {activity.timesAvailable.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setStartTime(t)}
                  className={cn(
                    "rounded-full border px-4 py-2 font-body text-sm font-medium transition-colors",
                    startTime === t ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="mt-1.5 font-body text-xs text-text-grey">Ends around {endTime}</p>
          </div>

          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Participants</p>
            <div className="mt-2">
              <CounterInput label="Participants" value={participants} onChange={setParticipants} min={1} max={activity.capacity + 20} />
            </div>
            {!fits && (
              <p className="mt-2 flex items-center gap-1.5 font-body text-sm text-orange">
                <AlertTriangle size={14} /> This activity can accommodate {activity.capacity} participants, but you&rsquo;ve set {participants}.
              </p>
            )}
          </div>

          {conflicts.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl bg-orange/10 px-4 py-3">
              <p className="flex items-center gap-1.5 font-body text-sm font-semibold text-orange">
                <AlertTriangle size={14} /> Schedule conflict detected
              </p>
              {conflicts.map((c, i) => (
                <p key={i} className="font-body text-sm text-navy/80">
                  {activity.name} overlaps with {c.label}.
                </p>
              ))}
              <label className="mt-1 flex items-center gap-2 font-body text-sm text-navy">
                <input type="checkbox" checked={addAnyway} onChange={(e) => setAddAnyway(e.target.checked)} className="h-4 w-4 accent-orange" />
                Add anyway
              </label>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Pricing</p>
            <p className="mt-1 font-body text-sm text-navy">
              {formatCurrency(activity.unitPrice)} {activity.pricingType === "per_person" ? `× ${participants}` : "(flat group price)"}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
              <span className="font-body text-sm font-semibold text-navy">Total</span>
              <span className="font-heading text-xl font-bold text-navy">{formatCurrency(total)}</span>
            </div>
            <motion.button
              type="button"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={!fits || (conflicts.length > 0 && !addAnyway) || !date}
              onClick={handleAdd}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check size={15} /> {editId ? "Save Changes" : "Add Activity"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
