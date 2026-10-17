"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, ArrowLeft, Check, Clock, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { Button } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter-input";
import { getActivityDetails, getSlotRemaining, isDateFullyUnavailable, totalParticipants } from "@/lib/activity-booking-api";
import { getActivityBookingDraft, saveActivityDate, saveActivitySelection, saveActivityTime, saveTicketQuantities } from "@/lib/activity-booking-state";
import type { Activity } from "@/lib/activity-booking-data";

const STEPS = ["Search", "Activity", "Guests", "Payment", "Confirmation"];
const DATE_WINDOW_DAYS = 14;

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function formatChipDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}

export function ActivityDetails({ activityId }: { activityId: string }) {
  const router = useRouter();
  const draft = getActivityBookingDraft();
  const search = draft.search;
  const [activity, setActivity] = useState<Activity | null | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!search) {
      router.replace("/book/activity");
      return;
    }
    getActivityDetails(activityId).then((a) => {
      setActivity(a);
      setActiveImage(a?.heroImage ?? null);
    });
    const currentDraft = getActivityBookingDraft();
    const isSameActivity = currentDraft.selectedActivityId === activityId;
    if (!isSameActivity) saveActivitySelection(activityId);
    const freshDraft = getActivityBookingDraft();
    setSelectedDate(freshDraft.selectedDate ?? search.activityDate);
    setSelectedTime(freshDraft.selectedTime ?? "");
    setQuantities(freshDraft.ticketQuantities ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  if (!search) return null;

  if (activity === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book an Activity" steps={STEPS} activeIndex={1} />
        <div className="h-72 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }

  if (activity === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This activity could not be found.</p>
        <button type="button" onClick={() => router.push("/book/activity/listings")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to listings
        </button>
      </div>
    );
  }

  const dateOptions = Array.from({ length: DATE_WINDOW_DAYS }, (_, i) => addDaysISO(todayISO(), i));
  const thumbnails = [activity.heroImage, ...activity.galleryImages];

  function handleDateSelect(date: string) {
    if (isDateFullyUnavailable(activity!, date)) return;
    setSelectedDate(date);
    setSelectedTime("");
    saveActivityDate(date);
  }

  function handleTimeSelect(time: string) {
    if (!selectedDate || getSlotRemaining(activity!, selectedDate, time) <= 0) return;
    setSelectedTime(time);
    saveActivityTime(time);
  }

  function updateQuantity(ticketTypeId: string, value: number) {
    const next = { ...quantities, [ticketTypeId]: Math.max(0, value) };
    setQuantities(next);
    saveTicketQuantities(next);
  }

  const remaining = selectedDate && selectedTime ? getSlotRemaining(activity, selectedDate, selectedTime) : null;
  const participants = totalParticipants(quantities);
  const exceedsCapacity = remaining !== null && participants > remaining;
  const canContinue = Boolean(selectedDate && selectedTime && participants >= 1 && !exceedsCapacity);

  function handleContinue() {
    if (!canContinue) return;
    router.push("/book/activity/guests");
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <BookingStepper title="Book an Activity" steps={STEPS} activeIndex={1} />

      <button type="button" onClick={() => router.push("/book/activity/listings")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to results
      </button>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <div className="relative col-span-1 row-span-2 h-64 overflow-hidden rounded-2xl sm:col-span-3 sm:h-[360px]">
          {activeImage && <Image src={activeImage} alt={activity.name} fill sizes="(min-width: 640px) 70vw, 100vw" className="object-cover" priority />}
        </div>
        {thumbnails.length > 1 &&
          thumbnails.slice(0, 2).map((img, i) => (
            <button key={i} type="button" onClick={() => setActiveImage(img)} className="relative hidden h-[176px] overflow-hidden rounded-2xl sm:block">
              <Image src={img} alt="" fill sizes="25vw" className="object-cover transition-transform duration-300 hover:scale-105" />
              {img === activeImage && <span className="absolute inset-0 ring-2 ring-inset ring-orange" />}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div>
            <span className="rounded-full bg-navy/5 px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-navy">{activity.category}</span>
            <h1 className="mt-2 font-heading text-2xl font-bold text-navy">{activity.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-text-grey">
              <MapPin size={13} /> {activity.location}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 font-body text-sm text-navy">
              <span className="flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-white">
                <Star size={12} className="fill-white" /> {activity.rating}
              </span>
              <span className="text-text-grey">{activity.reviewCount.toLocaleString("en-IN")} reviews</span>
              <span className="flex items-center gap-1 text-text-grey">
                <Clock size={13} /> {activity.durationHours} {activity.durationHours === 1 ? "hour" : "hours"}
              </span>
              {activity.difficulty && <span className="text-text-grey">{activity.difficulty}</span>}
            </div>
            {activity.minAge && (
              <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-orange/10 px-3 py-2 font-body text-xs font-medium text-orange">
                <AlertTriangle size={13} /> Minimum age {activity.minAge}+ — ticket types below reflect this restriction.
              </p>
            )}
          </div>

          <p className="font-body text-base leading-relaxed text-navy/80">{activity.fullDescription}</p>

          <div>
            <h2 className="font-heading text-base font-semibold text-navy">Highlights</h2>
            <ul className="mt-2 flex flex-col gap-1.5">
              {activity.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 font-body text-sm text-navy/80">
                  <Check size={14} className="mt-0.5 shrink-0 text-mint" /> {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h2 className="font-heading text-sm font-semibold text-navy">Included</h2>
              <ul className="mt-1.5 flex flex-col gap-1 font-body text-sm text-navy/80">
                {activity.included.map((i) => (
                  <li key={i}>&bull; {i}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold text-navy">Excluded</h2>
              <ul className="mt-1.5 flex flex-col gap-1 font-body text-sm text-navy/80">
                {activity.excluded.map((i) => (
                  <li key={i}>&bull; {i}</li>
                ))}
              </ul>
            </div>
          </div>

          {(activity.whatToBring || activity.safetyInfo) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {activity.whatToBring && (
                <div>
                  <h2 className="font-heading text-sm font-semibold text-navy">What to bring</h2>
                  <ul className="mt-1.5 flex flex-col gap-1 font-body text-sm text-navy/80">
                    {activity.whatToBring.map((i) => (
                      <li key={i}>&bull; {i}</li>
                    ))}
                  </ul>
                </div>
              )}
              {activity.safetyInfo && (
                <div>
                  <h2 className="font-heading text-sm font-semibold text-navy">Safety information</h2>
                  <ul className="mt-1.5 flex flex-col gap-1 font-body text-sm text-navy/80">
                    {activity.safetyInfo.map((i) => (
                      <li key={i}>&bull; {i}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div>
            <h2 className="font-heading text-sm font-semibold text-navy">Meeting point</h2>
            <p className="mt-1 font-body text-sm text-navy/80">{activity.meetingPoint}</p>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold text-navy">Cancellation policy</h2>
            <p className="mt-1 font-body text-sm text-navy/80">{activity.cancellationPolicy}</p>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white p-5">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Select date</p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {dateOptions.map((d) => {
                  const unavailable = isDateFullyUnavailable(activity, d);
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={unavailable}
                      onClick={() => handleDateSelect(d)}
                      className={cn(
                        "shrink-0 rounded-xl border px-3 py-2 font-body text-xs font-medium transition-colors",
                        unavailable
                          ? "cursor-not-allowed border-navy/5 bg-navy/[0.02] text-text-grey/50 line-through"
                          : selectedDate === d
                            ? "border-orange bg-orange/10 text-orange"
                            : "border-navy/15 text-navy hover:border-navy/30"
                      )}
                    >
                      {formatChipDate(d)}
                      {unavailable && <span className="block text-[10px]">Fully booked</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Select time slot</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activity.timesAvailable.map((t) => {
                    const slotRemaining = getSlotRemaining(activity, selectedDate, t);
                    const soldOut = slotRemaining <= 0;
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={soldOut}
                        onClick={() => handleTimeSelect(t)}
                        className={cn(
                          "rounded-xl border px-3 py-2 font-body text-xs font-medium transition-colors",
                          soldOut
                            ? "cursor-not-allowed border-navy/5 bg-navy/[0.02] text-text-grey/50 line-through"
                            : selectedTime === t
                              ? "border-orange bg-orange/10 text-orange"
                              : "border-navy/15 text-navy hover:border-navy/30"
                        )}
                      >
                        {t}
                        {!soldOut && <span className="block text-[10px] text-text-grey">{slotRemaining} left</span>}
                        {soldOut && <span className="block text-[10px]">Sold out</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 font-body text-[11px] text-text-grey">Mock availability shown for demonstration — not a live supplier feed.</p>
              </div>
            )}

            {selectedDate && selectedTime && (
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Select tickets</p>
                <div className="mt-2 flex flex-col gap-2">
                  {activity.ticketTypes.map((t) => (
                    <div key={t.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-body text-sm text-navy">
                            {t.label} {t.ageLabel && <span className="text-text-grey">({t.ageLabel})</span>}
                          </p>
                          <p className="font-body text-xs text-text-grey">{formatCurrency(t.price)} / person</p>
                        </div>
                      </div>
                      <CounterInput label={t.label} value={quantities[t.id] ?? 0} onChange={(v) => updateQuantity(t.id, v)} min={0} max={t.maxPerBooking ?? 20} />
                    </div>
                  ))}
                </div>

                <p className={cn("mt-2 font-body text-xs font-medium", exceedsCapacity ? "text-destructive" : "text-text-grey")}>
                  {participants} of {remaining} seats selected
                  {exceedsCapacity && ` — short by ${participants - (remaining ?? 0)} seat(s), reduce quantity or pick another slot`}
                </p>
              </div>
            )}

            <Button type="button" variant="accent" size="lg" disabled={!canContinue} onClick={handleContinue}>
              Continue to Guest Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
