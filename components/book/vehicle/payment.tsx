"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { PaymentPanel, type MockPaymentMethod, type PaymentPhase } from "@/components/book/shared/payment-panel";
import { VehicleBookingSummary } from "./booking-summary";
import { formatCurrency } from "@/lib/mock-trips";
import {
  calculateCombinationPrice,
  calculateKsrtcPrice,
  combinedCapacity,
  createMockBooking,
  getKsrtcServiceDetails,
  getVehicleDetails,
  type JourneySummary,
} from "@/lib/vehicle-booking-api";
import { computeDistanceKm } from "@/lib/vehicle-booking-data";
import { getVehicleBookingDraft, saveVehiclePaymentMethod, saveMockVehicleBooking, clearVehicleBookingDraft } from "@/lib/vehicle-booking-state";
import type { VehicleListing, KsrtcService } from "@/lib/vehicle-booking-data";

const STEPS = ["Search", "Mode", "Vehicle", "Passenger", "Payment", "Confirmation"];
const WELCOME_DISCOUNT = 200;

export function VehiclePayment() {
  const router = useRouter();
  const draft = getVehicleBookingDraft();
  const search = draft.search;
  const isPrivate = draft.transportMode === "private";

  const [privateVehicles, setPrivateVehicles] = useState<VehicleListing[] | null>(null);
  const [ksrtcService, setKsrtcService] = useState<KsrtcService | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [method, setMethod] = useState<MockPaymentMethod>(draft.paymentMethod ?? "upi");
  const [phase, setPhase] = useState<PaymentPhase>("idle");
  const submitting = useRef(false);

  useEffect(() => {
    if (!search || !draft.transportMode || !draft.passengerDetails) {
      router.replace("/book/vehicle");
      return;
    }
    if (isPrivate) {
      Promise.all((draft.selectedVehicleIds ?? []).map((id) => getVehicleDetails(id))).then((vs) => {
        setPrivateVehicles(vs.filter((v): v is VehicleListing => v !== null));
        setLoaded(true);
      });
    } else {
      getKsrtcServiceDetails(draft.selectedKsrtcServiceId ?? "").then((s) => {
        setKsrtcService(s);
        setLoaded(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || !draft.transportMode || !draft.passengerDetails) return null;
  if (!loaded) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={4} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }

  const distanceKm = computeDistanceKm(search.pickupLocationId, search.dropLocationId);
  const pricing = isPrivate && privateVehicles ? calculateCombinationPrice(privateVehicles, distanceKm, search.isRoundTrip, WELCOME_DISCOUNT) : ksrtcService ? calculateKsrtcPrice(ksrtcService, search.passengers, WELCOME_DISCOUNT) : null;

  if (!pricing) return null;

  async function pay(forceFailure = false) {
    if (submitting.current || !pricing) return;
    submitting.current = true;
    setPhase("processing");
    saveVehiclePaymentMethod(method);

    const journey: JourneySummary = {
      pickupLocationId: search!.pickupLocationId,
      pickupLocationName: search!.pickupLabel,
      dropLocationId: search!.dropLocationId,
      dropLocationName: search!.dropLabel,
      journeyDate: search!.journeyDate,
      pickupTime: search!.pickupTime,
      isRoundTrip: search!.isRoundTrip,
      returnDate: search!.returnDate,
      passengers: search!.passengers,
    };

    const booking = await createMockBooking(
      {
        transportMode: draft.transportMode!,
        journey,
        privateDetail:
          isPrivate && privateVehicles
            ? {
                distanceKm,
                vehicles: privateVehicles.map((veh) => ({ id: veh.id, name: veh.name, operatorName: veh.operatorName, categoryId: veh.categoryId, seatingCapacity: veh.seatingCapacity, cancellation: veh.cancellation, freeCancellationHoursBeforePickup: veh.freeCancellationHoursBeforePickup })),
                combinedCapacity: combinedCapacity(privateVehicles),
              }
            : undefined,
        ksrtcDetail: ksrtcService ? { service: { id: ksrtcService.id, busType: ksrtcService.busType, departureTime: ksrtcService.departureTime, arrivalTime: ksrtcService.arrivalTime, availableSeatsAtBooking: ksrtcService.availableSeats } } : undefined,
        passenger: draft.passengerDetails!,
        pricing,
        paymentMethod: method,
      },
      { forceFailure }
    );

    saveMockVehicleBooking(booking);

    if (booking.status === "CONFIRMED") {
      setPhase("confirming");
      const ref = booking.bookingReference;
      await new Promise((resolve) => setTimeout(resolve, 900));
      clearVehicleBookingDraft();
      router.replace(`/book/vehicle/success?ref=${ref}`);
      return;
    }

    submitting.current = false;
    setPhase("failed");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a Vehicle" steps={STEPS} activeIndex={4} />

      {phase !== "processing" && phase !== "confirming" && (
        <button type="button" onClick={() => router.push("/book/vehicle/review")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
          <ArrowLeft size={14} /> Back to review
        </button>
      )}

      {phase === "processing" || phase === "confirming" ? (
        <PaymentPanel totalLabel={formatCurrency(pricing.totalAmount)} phase={phase} method={method} onMethodChange={setMethod} onPay={() => pay(false)} onSimulateFailure={() => pay(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <h1 className="mb-5 font-heading text-xl font-bold text-navy">Choose Payment Method</h1>
            <PaymentPanel totalLabel={formatCurrency(pricing.totalAmount)} phase={phase} method={method} onMethodChange={setMethod} onPay={() => pay(false)} onSimulateFailure={() => pay(true)} />
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
              selectionSummary={
                isPrivate ? (
                  <p className="flex items-center gap-1.5 font-body text-sm text-navy">
                    <Users size={13} /> {privateVehicles?.length} vehicle{privateVehicles?.length === 1 ? "" : "s"}
                  </p>
                ) : (
                  <p className="font-body text-sm text-navy">{ksrtcService?.busType}</p>
                )
              }
              pricing={pricing}
            />
          </div>
        </div>
      )}
    </div>
  );
}
