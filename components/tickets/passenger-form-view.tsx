"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingStepper } from "@/components/book/shared/booking-stepper";
import { TICKET_STEPS } from "./ticket-search-view";
import { FormError } from "@/components/ui/form-error";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/mock-trips";
import { getScheduledServiceDetails, getServiceSeatLayout, getFareBreakdown } from "@/lib/ksrtc-ticket-api";
import { getTicketDraft, savePassengerDetails } from "@/lib/ksrtc-ticket-state";
import type { KsrtcScheduledService, KsrtcSeatLayout } from "@/lib/ksrtc-ticket-data";
import type { TicketPassenger } from "@/lib/ksrtc-ticket-api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\s-]{8,15}$/;

interface PassengerFormRow {
  name: string;
  age: string;
  gender: "male" | "female" | "other";
}

export function PassengerFormView() {
  const router = useRouter();
  const draft = getTicketDraft();
  const search = draft.search;
  const seatIds = draft.selectedSeatIds ?? [];

  const [service, setService] = useState<KsrtcScheduledService | null | undefined>(undefined);
  const [layout, setLayout] = useState<KsrtcSeatLayout | null>(null);
  const [rows, setRows] = useState<PassengerFormRow[]>(
    draft.passengers?.map((p) => ({ name: p.name, age: String(p.age), gender: p.gender })) ?? seatIds.map(() => ({ name: "", age: "", gender: "male" as const }))
  );
  const [phone, setPhone] = useState(draft.contact?.phone ?? "");
  const [email, setEmail] = useState(draft.contact?.email ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!search || !draft.selectedServiceId || seatIds.length === 0) {
      router.replace("/tickets/search");
      return;
    }
    Promise.all([getScheduledServiceDetails(draft.selectedServiceId), getServiceSeatLayout(draft.selectedServiceId)]).then(([s, l]) => {
      setService(s);
      setLayout(l);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!search || !draft.selectedServiceId || seatIds.length === 0) return null;
  if (service === undefined || layout === null) {
    return (
      <div className="flex flex-col gap-6 pb-16">
        <BookingStepper title="Book a KSRTC Ticket" steps={TICKET_STEPS} activeIndex={2} />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-navy/[0.06]" />
      </div>
    );
  }
  if (service === null) return null;

  const fare = getFareBreakdown(service.fare, seatIds.length);

  function updateRow(index: number, patch: Partial<PassengerFormRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function handleContinue() {
    for (const row of rows) {
      if (!row.name.trim()) return setError("Please enter a name for every passenger.");
      const age = Number(row.age);
      if (!age || age < 1 || age > 120) return setError("Please enter a valid age for every passenger.");
    }
    if (!PHONE_RE.test(phone)) return setError("Please enter a valid phone number.");
    if (!EMAIL_RE.test(email)) return setError("Please enter a valid email address.");

    setError(null);
    const passengers: TicketPassenger[] = rows.map((row, i) => ({
      name: row.name.trim(),
      age: Number(row.age),
      gender: row.gender,
      seatId: seatIds[i],
      seatLabel: layout!.seats.find((s) => s.id === seatIds[i])?.label ?? "",
    }));
    savePassengerDetails(passengers, { phone: phone.trim(), email: email.trim() });
    router.push("/tickets/review");
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <BookingStepper title="Book a KSRTC Ticket" steps={TICKET_STEPS} activeIndex={2} />

      <button type="button" onClick={() => router.push("/tickets/seats?service=" + draft.selectedServiceId)} className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-navy">
        <ArrowLeft size={14} /> Back to seats
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <h1 className="font-heading text-xl font-bold text-navy">Passenger Details</h1>

          {rows.map((row, index) => {
            const seatLabel = layout!.seats.find((s) => s.id === seatIds[index])?.label ?? "";
            return (
              <div key={seatIds[index]} className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-5">
                <p className="font-body text-sm font-semibold text-navy">Seat {seatLabel}</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr_1.2fr]">
                  <div>
                    <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Full name</label>
                    <input value={row.name} onChange={(e) => updateRow(index, { name: e.target.value })} className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
                  </div>
                  <div>
                    <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Age</label>
                    <input type="number" min={1} max={120} value={row.age} onChange={(e) => updateRow(index, { age: e.target.value })} className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
                  </div>
                  <div>
                    <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Gender</label>
                    <select value={row.gender} onChange={(e) => updateRow(index, { gender: e.target.value as PassengerFormRow["gender"] })} className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex flex-col gap-4 rounded-2xl border border-navy/10 bg-white p-5">
            <p className="font-body text-sm font-semibold text-navy">Contact details</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Phone number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ticket updates will be sent here" className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
              </div>
              <div>
                <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 font-body text-sm text-navy" />
              </div>
            </div>
          </div>

          {error && <FormError message={error} />}

          <Button type="button" variant="accent" size="lg" className="mt-1" onClick={handleContinue}>
            Continue to Review
          </Button>
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-6">
            <p className="font-heading text-base font-semibold text-navy">
              {search.fromLabel} &rarr; {search.toLabel}
            </p>
            <p className="font-body text-sm text-text-grey">
              {service.departureTime} &rarr; {service.arrivalTime} &middot; {seatIds.length} seat{seatIds.length === 1 ? "" : "s"}
            </p>
            <div className="border-t border-navy/10 pt-3">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Estimated total</p>
              <p className="mt-1 font-heading text-xl font-bold text-navy">{formatCurrency(fare.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
