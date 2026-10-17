"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { ActivityCard } from "./activity-card";
import { FormError } from "@/components/ui/form-error";
import { Button } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter-input";
import { ACTIVITY_DESTINATIONS } from "@/lib/activity-booking-data";
import { searchPopularActivities } from "@/lib/activity-booking-api";
import type { Activity } from "@/lib/activity-booking-data";
import { getActivityBookingDraft, saveActivitySearchCriteria } from "@/lib/activity-booking-state";

const STEPS = ["Search", "Activity", "Guests", "Payment", "Confirmation"];

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function ActivitySearch() {
  const router = useRouter();
  const existing = getActivityBookingDraft().search;

  const [destinationId, setDestinationId] = useState(existing?.destinationId ?? "");
  const [activityDate, setActivityDate] = useState(existing?.activityDate ?? "");
  const [adults, setAdults] = useState(existing?.adults ?? 2);
  const [children, setChildren] = useState(existing?.children ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [popular, setPopular] = useState<Activity[]>([]);

  useEffect(() => {
    if (!existing) setActivityDate(todayISO());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!destinationId) {
      setPopular([]);
      return;
    }
    searchPopularActivities(destinationId).then(setPopular);
  }, [destinationId]);

  const selectedDestination = ACTIVITY_DESTINATIONS.find((d) => d.id === destinationId);

  function trySubmitSearch(): boolean {
    if (!destinationId) {
      setError("Please select a destination.");
      return false;
    }
    if (!activityDate) {
      setError("Please select an activity date.");
      return false;
    }
    if (activityDate < todayISO()) {
      setError("Activity date cannot be in the past.");
      return false;
    }
    if (adults < 1) {
      setError("At least 1 adult is required.");
      return false;
    }
    if (children < 0) {
      setError("Children count cannot be negative.");
      return false;
    }

    setError(null);
    const destination = ACTIVITY_DESTINATIONS.find((d) => d.id === destinationId)!;
    saveActivitySearchCriteria({
      destinationId,
      destinationLabel: `${destination.name}, ${destination.region}`,
      activityDate,
      adults,
      children,
    });
    return true;
  }

  function handleSearch() {
    if (trySubmitSearch()) router.push("/book/activity/popular");
  }

  function handleSelectPopular(activityId: string) {
    if (trySubmitSearch()) router.push(`/book/activity/${activityId}`);
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book an Activity" steps={STEPS} activeIndex={0} />

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Just one thing to book?</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Book an Activity</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Find things to do in Kerala — no trip planning required.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white p-6">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Destination</label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            >
              <option value="">Kerala</option>
              {ACTIVITY_DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}, {d.region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Activity date</label>
            <input
              type="date"
              value={activityDate}
              min={todayISO()}
              onChange={(e) => setActivityDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Participants</label>
            <CounterInput label="Adults" value={adults} onChange={setAdults} min={1} max={20} />
            <CounterInput label="Children" value={children} onChange={setChildren} min={0} max={20} />
          </div>

          {error && <FormError message={error} />}

          <Button type="button" variant="accent" size="lg" className="mt-1" onClick={handleSearch}>
            Explore Activities
          </Button>
        </div>

        <div className="hidden overflow-hidden rounded-2xl lg:block">
          <div className="relative h-full min-h-[320px] w-full">
            <Image
              src={selectedDestination?.heroImage ?? "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80"}
              alt=""
              fill
              sizes="380px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="font-heading text-lg font-semibold text-white">{selectedDestination ? `${selectedDestination.name}, ${selectedDestination.region}` : "Find things to do in Kerala"}</p>
              <p className="mt-1 font-body text-xs text-white/80">
                {adults + children} participant{adults + children === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {popular.length > 0 && (
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-text-grey">Popular in {selectedDestination?.name}</p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {popular.map((a) => (
              <ActivityCard key={a.id} activity={a} onSelect={() => handleSelectPopular(a.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
