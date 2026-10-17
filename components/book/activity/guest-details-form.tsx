"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { ActivityBookingSummary } from "./booking-summary";
import { FormError } from "@/components/ui/form-error";
import { Button } from "@/components/ui/button";
import { getActivityDetails, totalParticipants } from "@/lib/activity-booking-api";
import { getActivityBookingDraft, saveActivityGuestDetails } from "@/lib/activity-booking-state";
import type { Activity } from "@/lib/activity-booking-data";

const STEPS = ["Search", "Activity", "Guests", "Payment", "Confirmation"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\s-]{8,15}$/;

export function GuestDetailsForm() {
  const router = useRouter();
  const draft = getActivityBookingDraft();
  const search = draft.search;
  const participants = totalParticipants(draft.ticketQuantities ?? {});
  const hasValidSelection = Boolean(draft.selectedActivityId && draft.selectedDate && draft.selectedTime && participants >= 1);

  const [activity, setActivity] = useState<Activity | null | undefined>(undefined);
  const [firstName, setFirstName] = useState(draft.guestDetails?.firstName ?? "");
  const [lastName, setLastName] = useState(draft.guestDetails?.lastName ?? "");
  const [email, setEmail] = useState(draft.guestDetails?.email ?? "");
  const [phone, setPhone] = useState(draft.guestDetails?.phone ?? "");
  const [specialRequests, setSpecialRequests] = useState(draft.guestDetails?.specialRequests ?? "");
  const [error, setError] = useState<string | null>(null);

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
        <div className="h-40 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (activity === null) return null;

  function handleContinue() {
    if (!firstName.trim()) return setError("Please enter your first name.");
    if (!lastName.trim()) return setError("Please enter your last name.");
    if (!EMAIL_RE.test(email)) return setError("Please enter a valid email address.");
    if (!PHONE_RE.test(phone)) return setError("Please enter a valid phone number.");

    setError(null);
    saveActivityGuestDetails({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      specialRequests: specialRequests.trim() || undefined,
    });
    router.push("/book/activity/review");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book an Activity" steps={STEPS} activeIndex={2} />

      <button type="button" onClick={() => router.push(`/book/activity/${activity.id}`)} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to activity
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white p-6">
          <h1 className="font-heading text-xl font-bold text-navy">Your Details</h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Full name as per ID"
                className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Mobile number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="For booking confirmation"
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="For booking confirmation"
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Special requirements (optional)</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. dietary needs, accessibility requirements"
              rows={3}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
            <p className="mt-1.5 font-body text-xs text-text-grey">Special requirements are subject to availability and are not guaranteed.</p>
          </div>

          {error && <FormError message={error} />}

          <Button type="button" variant="accent" size="lg" className="mt-1" onClick={handleContinue}>
            Continue to Review
          </Button>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <ActivityBookingSummary
            activityName={activity.name}
            location={activity.location}
            date={draft.selectedDate!}
            time={draft.selectedTime!}
            participants={participants}
            compact
          />
        </div>
      </div>
    </div>
  );
}
