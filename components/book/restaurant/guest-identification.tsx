"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { FormError } from "@/components/ui/form-error";
import { Button } from "@/components/ui/button";
import { getRestaurantBookingDraft, getNextIncompleteGuestIndex, saveGuestName } from "@/lib/restaurant-booking-state";

const STEPS = ["Search", "Restaurant", "Menu", "Guests", "Payment", "Confirmation"];

export function GuestIdentification({ index }: { index: number }) {
  const router = useRouter();
  const draft = getRestaurantBookingDraft();
  const search = draft.search;
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const guestCount = search?.guestCount ?? 0;
  const validIndex = Number.isInteger(index) && index >= 0 && index < guestCount;

  useEffect(() => {
    if (!search || !draft.selectedRestaurantId) {
      router.replace("/book/restaurant");
      return;
    }
    if (!validIndex) {
      router.replace("/book/restaurant/review");
      return;
    }
    // A guest's identify page is only reachable once every earlier guest
    // has finished both steps — otherwise bounce to wherever the draft
    // actually is, so a hand-typed URL can never skip the queue.
    const nextIncomplete = getNextIncompleteGuestIndex(draft);
    if (nextIncomplete !== index) {
      router.replace(nextIncomplete >= guestCount ? "/book/restaurant/review" : `/book/restaurant/guests/${nextIncomplete}/identify`);
      return;
    }
    setName(draft.guestNames?.[index] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!search || !draft.selectedRestaurantId || !validIndex) return null;

  function handleContinue() {
    if (!name.trim()) return setError("Please enter this guest's name.");
    setError(null);
    saveGuestName(index, name.trim());
    router.push(`/book/restaurant/guests/${index}/dish`);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 pb-16">
      <BookingStepper title="Book a Restaurant" steps={STEPS} activeIndex={3} />

      {index > 0 && (
        <button type="button" onClick={() => router.push(`/book/restaurant/guests/${index - 1}/dish`)} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
          <ArrowLeft size={14} /> Back
        </button>
      )}

      <div className="rounded-2xl border border-navy/10 bg-white p-6">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
          Guest {index + 1} of {guestCount}
        </p>
        <h1 className="mt-1 font-heading text-lg font-semibold text-navy">What&rsquo;s your name?</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Each guest picks their own dish next.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Arjun S."
          className="mt-4 w-full rounded-xl border border-navy/15 bg-navy/[0.03] px-4 py-3 font-body text-base text-navy placeholder:text-text-grey/60 focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10"
        />
        {error && (
          <div className="mt-3">
            <FormError message={error} />
          </div>
        )}
        <Button type="button" variant="accent" size="lg" className="mt-4 w-full" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
