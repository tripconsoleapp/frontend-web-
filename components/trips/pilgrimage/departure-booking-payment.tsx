"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, Building2, Check, CreditCard, QrCode, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { BookingHeader } from "@/components/trips/pilgrimage/booking-header";
import { formatCurrency } from "@/lib/mock-trips";
import { Template } from "@/lib/mock-templates";
import { PaymentMethod } from "@/lib/listing-draft";
import { paymentMethodLabel, generateTransactionId } from "@/lib/trip-operations";
import { PilgrimageDeparture } from "@/lib/pilgrimage-departures";
import {
  DeparturePaymentAttempt,
  DepartureBooking,
  addPaymentAttempt,
  getActiveBooking,
  getBooking,
  resolvePaymentAttempt,
} from "@/lib/pilgrimage-booking";

const STAGE_LABELS = ["Contacting payment gateway", "Confirming seats for this departure", "Recording payment"];

const METHODS: { id: PaymentMethod; icon: typeof CreditCard; description: string }[] = [
  { id: "card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
  { id: "upi", icon: QrCode, description: "Google Pay, PhonePe, BHIM" },
  { id: "netbanking", icon: Building2, description: "All major Indian banks" },
];

function generateAttemptId() {
  return `dpay_${Math.random().toString(36).slice(2, 10)}`;
}

export function DepartureBookingPayment({
  departure,
  template,
  bookingId,
}: {
  departure: PilgrimageDeparture;
  template: Template;
  bookingId?: string;
}) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const detailHref = `/pilgrimage/scheduled/${departure.id}`;
  const [booking, setBooking] = useState<DepartureBooking | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardLast4, setCardLast4] = useState("");
  const [processing, setProcessing] = useState(false);
  const [stageIndex, setStageIndex] = useState(-1);
  const [lastFailed, setLastFailed] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    const active = (bookingId ? getBooking(bookingId) : null) ?? getActiveBooking(departure.id);
    if (!active || active.passengers.length !== active.participantCount) {
      router.replace(`${detailHref}/participants`);
      return;
    }
    setBooking(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!booking) return <div className="h-64" />;

  const canPay = method !== "card" || cardLast4.length === 4;

  async function submitPayment(outcome: "succeed" | "fail") {
    if (!booking || submittingRef.current) return;
    submittingRef.current = true;
    setLastFailed(false);

    const attemptId = generateAttemptId();
    const methodLabel = method === "card" ? `${paymentMethodLabel(method)} ending in ${cardLast4 || "0000"}` : paymentMethodLabel(method);
    const attempt: DeparturePaymentAttempt = {
      id: attemptId,
      amount: booking.amount,
      method,
      methodLabel,
      status: "processing",
      transactionId: null,
      createdAt: new Date().toISOString(),
    };
    addPaymentAttempt(booking.id, attempt);
    setProcessing(true);

    for (let i = 0; i < STAGE_LABELS.length; i++) {
      setStageIndex(i);
      await new Promise((r) => setTimeout(r, shouldReduce ? 0 : 380));
    }

    const transactionId = outcome === "succeed" ? generateTransactionId() : null;
    resolvePaymentAttempt(booking.id, attemptId, outcome === "succeed" ? "succeeded" : "failed", transactionId);

    setProcessing(false);
    setStageIndex(-1);
    submittingRef.current = false;

    if (outcome === "succeed") {
      router.push(`${detailHref}/confirmed?booking=${booking.id}`);
    } else {
      setBooking(getBooking(booking.id));
      setLastFailed(true);
    }
  }

  if (processing) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-8 py-24 text-center">
        <motion.span
          animate={{ rotate: shouldReduce ? 0 : 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/5 text-navy"
        >
          <RefreshCcw size={22} />
        </motion.span>
        <div>
          <h1 className="font-heading text-xl font-bold text-navy">Processing your payment...</h1>
          <p className="mt-1 font-body text-sm text-text-grey">Please don&rsquo;t close this window.</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2.5 text-left">
          {STAGE_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  i < stageIndex ? "bg-mint/60 text-navy" : i === stageIndex ? "border-2 border-orange" : "border border-navy/15"
                )}
              >
                {i < stageIndex && <Check size={11} />}
              </span>
              <span className={cn("font-body text-sm", i > stageIndex ? "text-text-grey/60" : "text-navy")}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <BookingHeader
        title={departure.title}
        imageUrl={template.imageUrl}
        departureDate={departure.departureDate}
        returnDate={departure.returnDate}
        backHref={`${detailHref}/summary?booking=${booking.id}`}
        activeIndex={3}
      />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Payment</h1>
        <p className="mt-1 font-body text-base text-text-grey">
          Complete payment to confirm your spot.
        </p>
      </div>

      {lastFailed && (
        <div className="flex items-start gap-3 rounded-2xl bg-destructive-soft px-5 py-4">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="font-heading text-sm font-semibold text-destructive">Payment Failed</p>
            <p className="mt-0.5 font-body text-sm text-destructive">
              Your payment could not be completed. Your seats are still held — you can retry below.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-navy/10 p-5">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
          {departure.title}
        </p>
        <div className="mt-2 flex items-center justify-between border-t border-navy/10 pt-3">
          <span className="font-body text-sm text-text-grey">
            {booking.participantCount} pilgrim{booking.participantCount === 1 ? "" : "s"}
          </span>
          <span className="font-heading text-xl font-bold text-navy">{formatCurrency(booking.amount)}</span>
        </div>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
          Select Payment Method
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                method === m.id ? "border-orange bg-orange/5" : "border-navy/15 hover:border-navy/30"
              )}
            >
              <m.icon size={18} className={method === m.id ? "text-orange" : "text-navy/50"} />
              <span>
                <span className="block font-body text-sm font-semibold text-navy">{paymentMethodLabel(m.id)}</span>
                <span className="block font-body text-xs text-text-grey">{m.description}</span>
              </span>
              {method === m.id && <Check size={14} className="ml-auto text-orange" />}
            </button>
          ))}
        </div>
        {method === "card" && (
          <input
            value={cardLast4}
            onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Last 4 digits of card (test only)"
            inputMode="numeric"
            className="mt-3 w-full max-w-xs rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy placeholder:text-text-grey/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
        )}
        <p className="mt-2 font-body text-xs text-text-grey">
          This is a mock payment environment — no real transaction occurs.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <motion.button
          type="button"
          whileHover={canPay ? { y: -1 } : undefined}
          whileTap={canPay ? { scale: 0.98 } : undefined}
          disabled={!canPay}
          onClick={() => submitPayment("succeed")}
          className={buttonVariants({
            variant: "accent",
            size: "lg",
            className: "disabled:cursor-not-allowed disabled:opacity-40",
          })}
        >
          Pay {formatCurrency(booking.amount)}
        </motion.button>
        <button
          type="button"
          onClick={() => submitPayment("fail")}
          className="font-body text-xs font-medium text-text-grey underline underline-offset-2 hover:text-destructive"
        >
          Simulate a failed payment
        </button>
      </div>
    </div>
  );
}
