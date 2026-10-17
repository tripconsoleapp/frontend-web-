"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { PaymentPanel, type MockPaymentMethod, type PaymentPhase } from "@/components/book/shared/payment-panel";
import { ActivityBookingSummary } from "./booking-summary";
import { formatCurrency } from "@/lib/mock-trips";
import { calculateActivityPrice, createMockBooking, getActivityDetails, getSlotRemaining, totalParticipants } from "@/lib/activity-booking-api";
import { clearActivityBookingDraft, getActivityBookingDraft, saveActivityPaymentMethod, saveMockActivityBooking } from "@/lib/activity-booking-state";
import type { Activity } from "@/lib/activity-booking-data";

const STEPS = ["Search", "Activity", "Guests", "Payment", "Confirmation"];
const WELCOME_DISCOUNT = 100;

export function ActivityPayment() {
  const router = useRouter();
  const draft = getActivityBookingDraft();
  const search = draft.search;
  const quantities = draft.ticketQuantities ?? {};
  const participants = totalParticipants(quantities);
  const hasValidDraft = Boolean(search && draft.selectedActivityId && draft.selectedDate && draft.selectedTime && participants >= 1 && draft.guestDetails);

  const [activity, setActivity] = useState<Activity | null | undefined>(undefined);
  const [method, setMethod] = useState<MockPaymentMethod>(draft.paymentMethod ?? "upi");
  const [phase, setPhase] = useState<PaymentPhase>("idle");
  const submitting = useRef(false);

  useEffect(() => {
    if (!hasValidDraft) {
      router.replace("/book/activity");
      return;
    }
    getActivityDetails(draft.selectedActivityId!).then(setActivity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasValidDraft) return null;

  if (activity === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book an Activity" steps={STEPS} activeIndex={3} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (activity === null) return null;

  const remaining = getSlotRemaining(activity, draft.selectedDate!, draft.selectedTime!);
  if (participants > remaining) {
    // The same capacity guard as Review — payment must never proceed on a
    // selection that no longer fits, even if the user reached this URL
    // directly after the slot became invalid.
    router.replace("/book/activity/review");
    return null;
  }

  const pricing = calculateActivityPrice(activity, quantities, WELCOME_DISCOUNT);

  async function pay(forceFailure = false) {
    if (submitting.current) return;
    submitting.current = true;
    setPhase("processing");
    saveActivityPaymentMethod(method);

    const ticketBreakdown = activity!.ticketTypes
      .filter((t) => (quantities[t.id] ?? 0) > 0)
      .map((t) => ({ ticketTypeId: t.id, label: t.label, price: t.price, quantity: quantities[t.id] }));

    const booking = await createMockBooking(
      {
        activityId: activity!.id,
        activityName: activity!.name,
        activityLocation: activity!.location,
        meetingPoint: activity!.meetingPoint,
        destinationId: search!.destinationId,
        destinationLabel: search!.destinationLabel,
        date: draft.selectedDate!,
        time: draft.selectedTime!,
        durationHours: activity!.durationHours,
        ticketBreakdown,
        participants,
        guest: draft.guestDetails!,
        pricing,
        paymentMethod: method,
      },
      { forceFailure }
    );

    saveMockActivityBooking(booking);

    if (booking.status === "CONFIRMED") {
      setPhase("confirming");
      const ref = booking.bookingReference;
      await new Promise((resolve) => setTimeout(resolve, 900));
      clearActivityBookingDraft();
      router.replace(`/book/activity/success?ref=${ref}`);
      return;
    }

    submitting.current = false;
    setPhase("failed");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book an Activity" steps={STEPS} activeIndex={3} />

      {phase !== "processing" && phase !== "confirming" && (
        <button type="button" onClick={() => router.push("/book/activity/review")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
          <ArrowLeft size={14} /> Back to review
        </button>
      )}

      {phase === "processing" || phase === "confirming" ? (
        <PaymentPanel
          totalLabel={formatCurrency(pricing.totalAmount)}
          phase={phase}
          method={method}
          onMethodChange={setMethod}
          onPay={() => pay(false)}
          onSimulateFailure={() => pay(true)}
          confirmingLabel="Confirming your booking…"
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <h1 className="mb-5 font-heading text-xl font-bold text-navy">Payment</h1>
            <div className="mb-5 rounded-2xl border border-navy/10 bg-white p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Price Breakdown</p>
              <div className="mt-2 flex flex-col gap-1.5 font-body text-sm text-navy">
                {pricing.lineItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-text-grey">{item.label}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-text-grey">Taxes &amp; fees</span>
                  <span>{formatCurrency(pricing.taxes + pricing.mandatoryFees)}</span>
                </div>
                {pricing.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-grey">Discount</span>
                    <span>&ndash;{formatCurrency(pricing.discount)}</span>
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between border-t border-navy/10 pt-2">
                  <span className="font-semibold text-navy">Total</span>
                  <span className="font-heading text-lg font-bold text-navy">{formatCurrency(pricing.totalAmount)}</span>
                </div>
              </div>
            </div>
            <PaymentPanel
              totalLabel={formatCurrency(pricing.totalAmount)}
              phase={phase}
              method={method}
              onMethodChange={setMethod}
              onPay={() => pay(false)}
              onSimulateFailure={() => pay(true)}
              confirmingLabel="Confirming your booking…"
            />
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
      )}
    </div>
  );
}
