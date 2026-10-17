"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { ActivityBookingSummary } from "./booking-summary";
import { Button } from "@/components/ui/button";
import { calculateActivityPrice, getActivityDetails, getSlotRemaining, totalParticipants } from "@/lib/activity-booking-api";
import { getActivityBookingDraft } from "@/lib/activity-booking-state";
import type { Activity } from "@/lib/activity-booking-data";

const STEPS = ["Search", "Activity", "Guests", "Payment", "Confirmation"];
const WELCOME_DISCOUNT = 100;

export function BookingReview() {
  const router = useRouter();
  const draft = getActivityBookingDraft();
  const search = draft.search;
  const quantities = draft.ticketQuantities ?? {};
  const participants = totalParticipants(quantities);
  const hasValidSelection = Boolean(draft.selectedActivityId && draft.selectedDate && draft.selectedTime && participants >= 1 && draft.guestDetails);

  const [activity, setActivity] = useState<Activity | null | undefined>(undefined);

  useEffect(() => {
    if (!search || !hasValidSelection) {
      router.replace(search && draft.selectedActivityId ? `/book/activity/${draft.selectedActivityId}` : "/book/activity");
      return;
    }
    getActivityDetails(draft.selectedActivityId!).then(setActivity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || !hasValidSelection) return null;

  if (activity === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book an Activity" steps={STEPS} activeIndex={2} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (activity === null) return null;

  // Recalculated fresh on every render from the current draft — never a
  // cached/stale number — and re-checked against the slot's capacity so a
  // booking can't proceed to payment on a summary that's no longer valid.
  const remaining = getSlotRemaining(activity, draft.selectedDate!, draft.selectedTime!);
  const overCapacity = participants > remaining;
  const pricing = calculateActivityPrice(activity, quantities, WELCOME_DISCOUNT);

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book an Activity" steps={STEPS} activeIndex={2} />

      <button type="button" onClick={() => router.push("/book/activity/guests")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to your details
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Booking Review</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{activity.name}</h1>
            <p className="font-body text-sm text-text-grey">{activity.location}</p>
          </div>

          {overCapacity && (
            <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive-soft px-4 py-3.5">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-destructive" />
              <div>
                <p className="font-body text-sm font-semibold text-destructive">This slot no longer fits your group</p>
                <p className="font-body text-xs text-destructive/90">
                  {participants} participants selected, but only {remaining} seats remain for this date and time. Go back and adjust your tickets or pick another slot.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Lead Guest</p>
            <p className="mt-1 font-body text-sm text-navy">
              {draft.guestDetails!.firstName} {draft.guestDetails!.lastName}
            </p>
            <p className="font-body text-xs text-text-grey">
              {draft.guestDetails!.email} &middot; {draft.guestDetails!.phone}
            </p>
            {draft.guestDetails!.specialRequests && (
              <p className="mt-2 rounded-lg bg-navy/[0.03] px-3 py-2 font-body text-xs text-navy/80">
                &ldquo;{draft.guestDetails!.specialRequests}&rdquo; — subject to availability, not guaranteed.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Meeting Point</p>
            <p className="mt-1 font-body text-sm text-navy">{activity.meetingPoint}</p>
            <p className="mt-3 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Cancellation Policy</p>
            <p className="mt-1 font-body text-sm text-navy/80">{activity.cancellationPolicy}</p>
          </div>

          <Button type="button" variant="accent" size="lg" disabled={overCapacity} onClick={() => router.push("/book/activity/payment")}>
            Continue to Payment
          </Button>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <ActivityBookingSummary
            activityName={activity.name}
            location={activity.location}
            date={draft.selectedDate!}
            time={draft.selectedTime!}
            participants={participants}
            pricing={pricing}
          />
        </div>
      </div>
    </div>
  );
}
