"use client";

/**
 * Generic mock payment UI shared by any standalone service-booking flow
 * that actually takes payment at booking time (Vehicle, Restaurant,
 * Activity — NOT Hotel, which keeps its own existing payment.tsx
 * untouched). Restaurant charges at booking time because guests pre-order
 * specific dishes here, not just reserve a table. Purely presentational +
 * phase bookkeeping; the caller supplies the actual mock-booking side
 * effect via onPay.
 */

import { Smartphone, CreditCard, Landmark, Lock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export type MockPaymentMethod = "upi" | "card" | "netbanking";
export type PaymentPhase = "idle" | "processing" | "confirming" | "failed";

const METHODS: { id: MockPaymentMethod; label: string; icon: typeof Smartphone }[] = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
];

export function PaymentPanel({
  totalLabel,
  phase,
  method,
  onMethodChange,
  onPay,
  onSimulateFailure,
  processingLabel = "Processing your payment…",
  confirmingLabel = "Confirming your booking…",
}: {
  totalLabel: string;
  phase: PaymentPhase;
  method: MockPaymentMethod;
  onMethodChange: (m: MockPaymentMethod) => void;
  onPay: () => void;
  onSimulateFailure: () => void;
  processingLabel?: string;
  confirmingLabel?: string;
}) {
  if (phase === "processing" || phase === "confirming") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <span className="flex h-14 w-14 animate-spin items-center justify-center rounded-full border-2 border-navy/15 border-t-orange" />
        <p className="font-heading text-lg font-semibold text-navy">{phase === "processing" ? processingLabel : confirmingLabel}</p>
        <p className="font-body text-sm text-text-grey">Please don&rsquo;t close this window or make another payment.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {phase === "failed" && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive-soft px-4 py-3.5">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="font-body text-sm font-semibold text-destructive">Payment unsuccessful</p>
            <p className="font-body text-xs text-destructive/90">Your booking has not been confirmed. No amount has been charged.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-5">
        {METHODS.map(({ id, label, icon: Icon }) => (
          <label
            key={id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
              method === id ? "border-orange bg-orange/[0.04]" : "border-navy/10"
            )}
          >
            <input type="radio" name="payment-method" checked={method === id} onChange={() => onMethodChange(id)} className="h-4 w-4 accent-orange" />
            <Icon size={18} className="text-navy" />
            <span className="font-body text-sm text-navy">{label}</span>
          </label>
        ))}
        <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-text-grey">
          <Lock size={12} /> Secure, encrypted transaction.
        </p>
      </div>

      <button type="button" onClick={onPay} className="rounded-full bg-orange px-6 py-4 font-body text-base font-semibold text-white transition-colors hover:bg-orange/90">
        Pay {totalLabel}
      </button>

      {phase === "failed" && (
        <button type="button" onClick={onPay} className="self-center font-body text-sm font-semibold text-navy underline underline-offset-2">
          Try Again
        </button>
      )}

      <button type="button" onClick={onSimulateFailure} className="self-center font-body text-[11px] text-text-grey/70 underline underline-offset-2">
        Simulate a failed payment (test)
      </button>
    </div>
  );
}
