"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { PaymentPanel, type MockPaymentMethod, type PaymentPhase } from "@/components/book/shared/payment-panel";
import { TICKET_STEPS } from "./ticket-search-view";
import { formatCurrency } from "@/lib/mock-trips";
import { BUS_TYPE_LABELS, CANCELLATION_POLICY, type KsrtcScheduledService, type KsrtcSeatLayout } from "@/lib/ksrtc-ticket-data";
import { getScheduledServiceDetails, getServiceSeatLayout, getFareBreakdown, createMockTicketBooking } from "@/lib/ksrtc-ticket-api";
import { getTicketDraft, saveTicketPaymentMethod, saveMockTicket, clearTicketDraft } from "@/lib/ksrtc-ticket-state";

export function ReviewView() {
  const router = useRouter();
  const draft = getTicketDraft();
  const search = draft.search;
  const seatIds = draft.selectedSeatIds ?? [];
  const passengers = draft.passengers ?? [];

  const [service, setService] = useState<KsrtcScheduledService | null | undefined>(undefined);
  const [layout, setLayout] = useState<KsrtcSeatLayout | null>(null);
  const [method, setMethod] = useState<MockPaymentMethod>((draft.paymentMethod as MockPaymentMethod) ?? "upi");
  const [phase, setPhase] = useState<PaymentPhase>("idle");
  const submitting = useRef(false);

  const ready = !!search && !!draft.selectedServiceId && seatIds.length > 0 && passengers.length === seatIds.length && !!draft.contact;

  useEffect(() => {
    if (!ready) {
      router.replace("/tickets/search");
      return;
    }
    Promise.all([getScheduledServiceDetails(draft.selectedServiceId!), getServiceSeatLayout(draft.selectedServiceId!)]).then(([s, l]) => {
      setService(s);
      setLayout(l);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  if (service === undefined || layout === null) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a KSRTC Ticket" steps={TICKET_STEPS} activeIndex={3} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (service === null) return null;

  const fare = getFareBreakdown(service.fare, seatIds.length);

  async function pay(forceFailure = false) {
    if (submitting.current) return;
    submitting.current = true;
    setPhase("processing");
    saveTicketPaymentMethod(method);

    const ticket = await createMockTicketBooking(
      {
        service: service!,
        fromLabel: search!.fromLabel,
        toLabel: search!.toLabel,
        boardingPointId: draft.boardingPointId!,
        boardingPointLabel: draft.boardingPointLabel!,
        droppingPointId: draft.droppingPointId!,
        droppingPointLabel: draft.droppingPointLabel!,
        passengers,
        contact: draft.contact!,
        fare,
        paymentMethod: method,
      },
      { forceFailure }
    );

    if (ticket.status === "CONFIRMED") {
      saveMockTicket(ticket);
      setPhase("confirming");
      await new Promise((resolve) => setTimeout(resolve, 900));
      clearTicketDraft();
      router.replace(`/tickets/${ticket.id}`);
      return;
    }

    submitting.current = false;
    setPhase("failed");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a KSRTC Ticket" steps={TICKET_STEPS} activeIndex={3} />

      {phase !== "processing" && phase !== "confirming" && (
        <button type="button" onClick={() => router.push("/tickets/passengers")} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
          <ArrowLeft size={14} /> Back to passengers
        </button>
      )}

      {phase === "processing" || phase === "confirming" ? (
        <PaymentPanel totalLabel={formatCurrency(fare.totalAmount)} phase={phase} method={method} onMethodChange={setMethod} onPay={() => pay(false)} onSimulateFailure={() => pay(true)} confirmingLabel="Confirming your ticket…" />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">{BUS_TYPE_LABELS[service.busType]}</p>
              <h1 className="mt-1 font-heading text-2xl font-bold text-navy">
                {search.fromLabel} &rarr; {search.toLabel}
              </h1>
              <p className="mt-1 font-body text-sm text-text-grey">
                {service.departureTime} &rarr; {service.arrivalTime} &middot; Boarding at {draft.boardingPointLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-navy/10 bg-white p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Passengers</p>
              <ul className="mt-3 flex flex-col gap-2">
                {passengers.map((p) => (
                  <li key={p.seatId} className="flex items-center justify-between font-body text-sm text-navy">
                    <span>{p.name} &middot; {p.age}, {p.gender}</span>
                    <span className="font-semibold text-text-grey">Seat {p.seatLabel}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-navy/10 bg-white p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Cancellation policy</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {CANCELLATION_POLICY.map((line) => (
                  <li key={line} className="flex items-start gap-1.5 font-body text-sm text-navy">
                    <Info size={14} className="mt-0.5 shrink-0 text-text-grey" /> {line}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-4 font-heading text-xl font-bold text-navy">Choose Payment Method</h2>
              <PaymentPanel totalLabel={formatCurrency(fare.totalAmount)} phase={phase} method={method} onMethodChange={setMethod} onPay={() => pay(false)} onSimulateFailure={() => pay(true)} />
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-6">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Fare breakdown</p>
              <div className="flex items-center justify-between font-body text-sm text-navy">
                <span>Base fare &times; {fare.seatCount}</span>
                <span>{formatCurrency(fare.baseFare)}</span>
              </div>
              <div className="flex items-center justify-between font-body text-sm text-navy">
                <span>Reservation fee</span>
                <span>{formatCurrency(fare.reservationFee)}</span>
              </div>
              <div className="flex items-center justify-between font-body text-sm text-navy">
                <span>GST (5%)</span>
                <span>{formatCurrency(fare.gst)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-navy/10 pt-3 font-heading text-base font-bold text-navy">
                <span>Total</span>
                <span>{formatCurrency(fare.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
