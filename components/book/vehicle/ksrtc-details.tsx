"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Users, Info } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { formatCurrency } from "@/lib/mock-trips";
import { getKsrtcServiceDetails, calculateKsrtcPrice } from "@/lib/vehicle-booking-api";
import { getVehicleBookingDraft, saveKsrtcServiceSelection } from "@/lib/vehicle-booking-state";
import type { KsrtcService } from "@/lib/vehicle-booking-data";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];

export function KsrtcDetails({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const draft = getVehicleBookingDraft();
  const search = draft.search;
  const [service, setService] = useState<KsrtcService | null | undefined>(undefined);

  useEffect(() => {
    if (!search || draft.transportMode !== "ksrtc") {
      router.replace("/book/vehicle");
      return;
    }
    getKsrtcServiceDetails(serviceId).then(setService);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  if (!search || draft.transportMode !== "ksrtc") return null;

  if (service === undefined) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={2} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }

  if (service === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-navy/10 bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">Service information could not be loaded.</p>
        <button type="button" onClick={() => router.push("/book/vehicle/ksrtc/listings")} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
          Back to services
        </button>
      </div>
    );
  }

  const fits = service.availableSeats >= search.passengers;
  const pricing = calculateKsrtcPrice(service, search.passengers);

  function handleSelect() {
    if (!fits) return;
    saveKsrtcServiceSelection(service!.id);
    router.push("/book/vehicle/confirm");
  }

  return (
    <div className="flex flex-col gap-8 pb-32">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={2} />

      <button type="button" onClick={() => router.push("/book/vehicle/ksrtc/listings")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to services
      </button>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">KSRTC</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{service.busType}</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {search.pickupLabel} &rarr; {search.dropLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-navy/10 bg-white p-5 sm:grid-cols-3">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Departure</p>
          <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-navy">
            <Clock size={14} /> {service.departureTime}
          </p>
        </div>
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Arrival</p>
          <p className="mt-1 flex items-center gap-1.5 font-body text-sm text-navy">
            <Clock size={14} /> {service.arrivalTime}
          </p>
        </div>
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Seats available</p>
          <p className={`mt-1 flex items-center gap-1.5 font-body text-sm ${fits ? "text-navy" : "font-semibold text-destructive"}`}>
            <Users size={14} /> {service.availableSeats} of {service.totalSeats}
          </p>
        </div>
      </div>

      {!fits && (
        <div className="rounded-2xl bg-destructive-soft px-4 py-3">
          <p className="font-body text-sm font-semibold text-destructive">
            Only {service.availableSeats} seat{service.availableSeats === 1 ? "" : "s"} available — your group needs {search.passengers}, short by {search.passengers - service.availableSeats}.
          </p>
          <button type="button" onClick={() => router.push("/book/vehicle/ksrtc/listings")} className="mt-1 font-body text-xs font-semibold text-destructive underline underline-offset-2">
            Choose a different service
          </button>
        </div>
      )}

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Service conditions</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {service.serviceConditions.map((c) => (
            <li key={c} className="flex items-start gap-1.5 font-body text-sm text-navy">
              <Info size={14} className="mt-0.5 shrink-0 text-text-grey" /> {c}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-navy/10 p-5">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Estimated Fare</p>
        <p className="mt-1 font-body text-sm text-text-grey">
          {formatCurrency(service.farePerSeat)} &times; {search.passengers} seat{search.passengers === 1 ? "" : "s"} + reservation fee
        </p>
        <p className="mt-2 font-heading text-xl font-bold text-navy">{formatCurrency(pricing.totalAmount)}</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-6 py-4 lg:left-60">
        <div>
          <p className="font-body text-sm font-semibold text-navy">{service.busType}</p>
          <p className="font-body text-xs text-text-grey">{formatCurrency(pricing.totalAmount)}</p>
        </div>
        <button
          type="button"
          onClick={handleSelect}
          disabled={!fits}
          className="rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Select Service
        </button>
      </div>
    </div>
  );
}
