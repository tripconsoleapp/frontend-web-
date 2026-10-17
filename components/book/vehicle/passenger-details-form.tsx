"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { VehicleBookingSummary } from "./booking-summary";
import { FormError } from "@/components/ui/form-error";
import { Button } from "@/components/ui/button";
import { getVehicleBookingDraft, savePassengerDetails } from "@/lib/vehicle-booking-state";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\s-]{8,15}$/;

export function PassengerDetailsForm() {
  const router = useRouter();
  const draft = getVehicleBookingDraft();
  const search = draft.search;
  const isPrivate = draft.transportMode === "private";
  const hasSelection = isPrivate ? (draft.selectedVehicleIds?.length ?? 0) > 0 : !!draft.selectedKsrtcServiceId;

  const [firstName, setFirstName] = useState(draft.passengerDetails?.firstName ?? "");
  const [lastName, setLastName] = useState(draft.passengerDetails?.lastName ?? "");
  const [email, setEmail] = useState(draft.passengerDetails?.email ?? "");
  const [phone, setPhone] = useState(draft.passengerDetails?.phone ?? "");
  const [specialRequests, setSpecialRequests] = useState(draft.passengerDetails?.specialRequests ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!search || !draft.transportMode || !hasSelection) {
      router.replace("/book/vehicle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || !draft.transportMode || !hasSelection) return null;

  function handleContinue() {
    if (!firstName.trim()) return setError("Please enter your first name.");
    if (!lastName.trim()) return setError("Please enter your last name.");
    if (!EMAIL_RE.test(email)) return setError("Please enter a valid email address.");
    if (!PHONE_RE.test(phone)) return setError("Please enter a valid phone number.");

    setError(null);
    savePassengerDetails({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim(), specialRequests: specialRequests.trim() || undefined });
    router.push("/book/vehicle/review");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={3} />

      <button type="button" onClick={() => router.push("/book/vehicle/confirm")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to confirmation
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5 rounded-2xl border border-navy/10 bg-white p-6">
          <h1 className="font-heading text-xl font-bold text-navy">Passenger Details</h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">First name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter your full name" className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
            </div>
            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Last name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
            </div>
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Phone number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
          </div>

          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Special requests (optional)</label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. child seat, extra stop, meet at terminal 2"
              rows={3}
              className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy"
            />
            <p className="mt-1.5 font-body text-xs text-text-grey">Special requests are subject to operator availability and are not guaranteed.</p>
          </div>

          {error && <FormError message={error} />}

          <Button type="button" variant="accent" size="lg" className="mt-1" onClick={handleContinue}>
            Continue to Review
          </Button>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <VehicleBookingSummary
            pickupLabel={search.pickupLabel}
            dropLabel={search.dropLabel}
            journeyDate={search.journeyDate}
            pickupTime={search.pickupTime}
            isRoundTrip={search.isRoundTrip}
            returnDate={search.returnDate}
            passengers={search.passengers}
            compact
          />
        </div>
      </div>
    </div>
  );
}
