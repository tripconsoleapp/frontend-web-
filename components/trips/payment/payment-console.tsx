"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, ArrowLeft, Building2, Check, CreditCard, Lock, QrCode, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { PaymentAttempt, PaymentMethod, PaymentPlanType, TripRecord, getServicesDraft, getTripRecord, saveTripRecord } from "@/lib/listing-draft";
import {
  computeTripPricing,
  createNotification,
  createPaymentPlan,
  currentCostSnapshot,
  derivePaymentStatus,
  generatePaymentAttemptId,
  generateTransactionId,
  hasInFlightAttempt,
  isBalanceOverdue,
  isPaymentPlanStale,
  paymentMethodLabel,
  paymentPlanOptions,
  remainingBalance,
  totalPaidAmount,
} from "@/lib/trip-operations";

const STAGE_LABELS = ["Contacting payment gateway", "Confirming amount against approved snapshot", "Recording payment"];

const METHODS: { id: PaymentMethod; icon: typeof CreditCard; description: string }[] = [
  { id: "card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
  { id: "upi", icon: QrCode, description: "Google Pay, PhonePe, BHIM" },
  { id: "netbanking", icon: Building2, description: "All major Indian banks" },
];

type FlowType = "advance" | "full" | "balance";

export function PaymentConsole({ tripId }: { tripId: string }) {
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const [record, setRecord] = useState<TripRecord | null>(null);
  const [services, setServices] = useState<ReturnType<typeof getServicesDraft> | null>(null);
  const [choosingPlan, setChoosingPlan] = useState<PaymentPlanType>("full");
  const [payFlow, setPayFlow] = useState<{ type: FlowType; amount: number } | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardLast4, setCardLast4] = useState("");
  const [processingAttemptId, setProcessingAttemptId] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(-1);
  const submittingRef = useRef(false);

  useEffect(() => {
    setRecord(getTripRecord());
    setServices(getServicesDraft());
  }, []);

  if (!record || !services) {
    return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;
  }

  if (record.id !== tripId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This trip couldn&rsquo;t be found.</p>
        <Link href="/trips" className="font-body text-sm font-semibold text-orange underline underline-offset-2">Back to My Trips</Link>
      </div>
    );
  }

  const snapshot = currentCostSnapshot(record.costSnapshots);
  const verificationApproved = record.verification.status === "approved";
  const paymentStatus = derivePaymentStatus({ verificationApproved, approvedTotal: snapshot?.total ?? 0, attempts: record.payment.attempts });
  const totalPaid = totalPaidAmount(record.payment.attempts);
  const remaining = snapshot ? remainingBalance(snapshot.total, record.payment.attempts) : 0;

  // Stale-snapshot protection: if the trip was edited after approval and the
  // live estimate no longer matches what was approved, payment is blocked
  // entirely rather than silently charging an outdated amount.
  const livePricing = computeTripPricing(services, { passengerCount: trip.passengerCount, participantBreakdown: trip.participantBreakdown });
  const snapshotStale = Boolean(snapshot && verificationApproved && paymentStatus !== "paid" && livePricing.total !== snapshot.total);
  // A plan created against an older approved snapshot (e.g. a partial
  // payment was made, then the trip was edited and re-approved at a
  // different total) can never be reused — force a fresh plan choice
  // rather than silently paying off a balance computed against the
  // wrong number.
  const planStale = isPaymentPlanStale(record.payment.plan, snapshot?.id ?? null);
  const needsFreshPlan = planStale && !snapshotStale && paymentStatus !== "paid" && paymentStatus !== "locked";
  const effectiveStatus = needsFreshPlan ? "unlocked" : paymentStatus;

  function persist(next: TripRecord) {
    saveTripRecord(next);
    setRecord(next);
  }

  function choosePlan(type: PaymentPlanType) {
    if (!record || !snapshot) return;
    const plan = createPaymentPlan(type, snapshot, trip.startDate);
    persist({ ...record, payment: { ...record.payment, plan } });
    // If money was already paid against a superseded plan (needsFreshPlan),
    // the new plan's percentages still apply to the full approved total,
    // but what's actually collected now must account for what's already
    // in the ledger — never re-charge an amount already paid.
    const advanceRemaining = plan.advanceAmount - totalPaid;
    const amountDueNow = type === "full" ? remaining : advanceRemaining > 0 ? Math.min(advanceRemaining, remaining) : remaining;
    setPayFlow({ type: type === "full" ? "full" : "advance", amount: amountDueNow });
  }

  function startBalancePayment() {
    setPayFlow({ type: "balance", amount: remaining });
  }

  function retryLastAmount() {
    if (!record) return;
    const plan = record.payment.plan;
    const type: FlowType = totalPaid === 0 ? (plan?.type === "full" ? "full" : "advance") : "balance";
    const amount = totalPaid === 0 && plan?.type === "advance_balance" ? plan.advanceAmount : remaining;
    setPayFlow({ type, amount });
  }

  async function submitPayment(outcome: "succeed" | "fail") {
    if (!record || !snapshot || !payFlow || submittingRef.current) return;
    if (hasInFlightAttempt(record.payment.attempts, record.payment.plan?.id ?? "")) return;
    submittingRef.current = true;

    const attemptId = generatePaymentAttemptId();
    const methodLabel = method === "card" ? `${paymentMethodLabel(method)} ending in ${cardLast4 || "0000"}` : paymentMethodLabel(method);
    const attempt: PaymentAttempt = {
      id: attemptId,
      snapshotId: snapshot.id,
      paymentPlanId: record.payment.plan?.id ?? "unknown",
      type: payFlow.type,
      amount: payFlow.amount,
      method,
      methodLabel,
      status: "processing",
      transactionId: null,
      createdAt: new Date().toISOString(),
    };
    persist({ ...getTripRecord(), payment: { ...getTripRecord().payment, attempts: [...getTripRecord().payment.attempts, attempt] } });
    setProcessingAttemptId(attemptId);

    for (let i = 0; i < STAGE_LABELS.length; i++) {
      setStageIndex(i);
      await new Promise((r) => setTimeout(r, shouldReduce ? 0 : 380));
    }

    const current = getTripRecord();
    const resolvedAttempts = current.payment.attempts.map((a): PaymentAttempt =>
      a.id === attemptId
        ? { ...a, status: outcome === "succeed" ? "succeeded" : "failed", transactionId: outcome === "succeed" ? generateTransactionId() : null }
        : a
    );
    const newTotalPaid = totalPaidAmount(resolvedAttempts);
    const nowPaidInFull = newTotalPaid >= snapshot.total;

    const notification =
      outcome === "succeed"
        ? createNotification({
            type: "payment",
            severity: "success",
            title: nowPaidInFull ? "Payment successful" : "Advance payment received",
            message: nowPaidInFull ? `${formatCurrency(payFlow.amount)} paid — your trip is fully paid.` : `${formatCurrency(payFlow.amount)} received. ${formatCurrency(snapshot.total - newTotalPaid)} balance remaining.`,
            actionHref: `/trips/${tripId}/payment`,
          })
        : createNotification({
            type: "payment",
            severity: "action_required",
            title: "Payment failed",
            message: "Your payment could not be completed. Your approved snapshot is unaffected — you can retry.",
            actionHref: `/trips/${tripId}/payment`,
          });

    persist({
      ...current,
      status: nowPaidInFull && current.status === "verified" ? "paid" : current.status,
      payment: { ...current.payment, attempts: resolvedAttempts },
      notifications: [...current.notifications, notification],
    });

    setProcessingAttemptId(null);
    setStageIndex(-1);
    setPayFlow(null);
    submittingRef.current = false;
  }

  if (processingAttemptId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 py-16 text-center">
        <motion.span animate={{ rotate: shouldReduce ? 0 : 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/5 text-navy">
          <RefreshCcw size={22} />
        </motion.span>
        <div>
          <h1 className="font-heading text-xl font-bold text-navy">Processing your payment...</h1>
          <p className="mt-1 font-body text-sm text-text-grey">Please don&rsquo;t close this window or submit again.</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2.5 text-left">
          {STAGE_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", i < stageIndex ? "bg-mint/60 text-navy" : i === stageIndex ? "border-2 border-orange" : "border border-navy/15")}>
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
    <div className="flex flex-col gap-8 pb-10">
      <Link href={`/trips/${tripId}/operations`} className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
        <ArrowLeft size={14} /> Back to operations
      </Link>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">{record.reference}</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Payment</h1>
      </div>

      {paymentStatus === "locked" && (
        <div className="flex items-start gap-3 rounded-2xl bg-navy/[0.03] px-6 py-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy"><Lock size={16} /></span>
          <div>
            <p className="font-heading text-base font-semibold text-navy">Payment Locked</p>
            <p className="mt-0.5 font-body text-sm text-text-grey">Payment unlocks once your cost snapshot has been reviewed and approved.</p>
            <Link href={`/trips/${tripId}/verification`} className="mt-2 inline-block font-body text-sm font-semibold text-orange underline underline-offset-2">Check verification status</Link>
          </div>
        </div>
      )}

      {paymentStatus !== "locked" && snapshotStale && (
        <div className="flex items-start gap-3 rounded-2xl bg-destructive-soft px-6 py-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive text-white"><AlertTriangle size={16} /></span>
          <div>
            <p className="font-heading text-base font-semibold text-destructive">Approved cost no longer matches this trip</p>
            <p className="mt-0.5 font-body text-sm text-destructive">A service was changed after approval. Review the updated cost and resubmit for verification before paying.</p>
            <Link href={`/trips/${tripId}/cost`} className="mt-2 inline-block font-body text-sm font-semibold text-destructive underline underline-offset-2">Review Changes</Link>
          </div>
        </div>
      )}

      {needsFreshPlan && (
        <div className="flex items-start gap-3 rounded-2xl bg-orange/10 px-6 py-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange text-white"><RefreshCcw size={16} /></span>
          <div>
            <p className="font-heading text-base font-semibold text-navy">A new payment plan is needed</p>
            <p className="mt-0.5 font-body text-sm text-text-grey">
              {formatCurrency(totalPaid)} already paid is preserved. The trip was re-approved at a different amount, so choose a new plan against the current approved total of {formatCurrency(snapshot?.total ?? 0)}.
            </p>
          </div>
        </div>
      )}

      {!snapshotStale && effectiveStatus === "unlocked" && snapshot && !payFlow && (
        <PlanChooser snapshotTotal={snapshot.total} plan={choosingPlan} onSelectPlan={setChoosingPlan} onContinue={() => choosePlan(choosingPlan)} />
      )}

      {!snapshotStale && !needsFreshPlan && effectiveStatus === "failed" && !payFlow && (
        <>
          <div className="flex items-start gap-3 rounded-2xl bg-destructive-soft px-6 py-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive text-white"><AlertTriangle size={16} /></span>
            <div>
              <p className="font-heading text-base font-semibold text-destructive">Payment Failed</p>
              <p className="mt-0.5 font-body text-sm text-destructive">Your payment could not be completed. Your approved snapshot is unaffected.</p>
            </div>
          </div>
          <button type="button" onClick={retryLastAmount} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90">
            Retry Payment
          </button>
        </>
      )}

      {!snapshotStale && paymentStatus === "pending" && (
        <div className="flex items-start gap-3 rounded-2xl bg-orange/10 px-6 py-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange text-white"><RefreshCcw size={16} /></span>
          <div>
            <p className="font-heading text-base font-semibold text-navy">Payment Pending</p>
            <p className="mt-0.5 font-body text-sm text-text-grey">We&rsquo;re waiting for confirmation from the payment provider. This page will update automatically.</p>
          </div>
        </div>
      )}

      {!snapshotStale && payFlow && snapshot && (
        <PaymentMethodStep
          tripName={trip.tripName || "Your Trip"}
          amount={payFlow.amount}
          method={method}
          onSelectMethod={setMethod}
          cardLast4={cardLast4}
          onCardLast4={setCardLast4}
          onCancel={() => setPayFlow(null)}
          onPay={() => submitPayment("succeed")}
          onSimulateFailure={() => submitPayment("fail")}
        />
      )}

      {!snapshotStale && paymentStatus === "partially_paid" && snapshot && !payFlow && (
        <>
          <div className="rounded-2xl border border-navy/10 p-6">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Payment Plan Active</p>
            <p className="mt-1 font-heading text-2xl font-bold text-navy">{formatCurrency(totalPaid)} paid</p>
            <p className="font-body text-sm text-text-grey">{formatCurrency(remaining)} balance remaining of {formatCurrency(snapshot.total)}</p>
            {record.payment.plan?.balanceDueDate && (
              <p className={cn("mt-1 font-body text-sm", isBalanceOverdue(record.payment.plan, remaining) ? "font-semibold text-destructive" : "text-text-grey")}>
                {isBalanceOverdue(record.payment.plan, remaining) ? "Payment overdue — " : "Balance due by "}
                {new Date(record.payment.plan.balanceDueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
          <button type="button" onClick={startBalancePayment} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90">
            Pay Balance — {formatCurrency(remaining)}
          </button>
        </>
      )}

      {paymentStatus === "paid" && snapshot && (
        <motion.div initial={shouldReduce ? undefined : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 rounded-2xl bg-mint/20 px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-navy">
            <Check size={26} />
          </span>
          <h2 className="font-heading text-xl font-bold text-navy">{record.payment.attempts.length > 1 ? "Balance Cleared — Trip Fully Paid" : "Payment Successful"}</h2>
          <p className="font-body text-sm text-text-grey">Total Paid</p>
          <p className="font-heading text-2xl font-bold text-navy">{formatCurrency(totalPaid)}</p>
          <p className="font-body text-sm text-text-grey">Snapshot Version {snapshot.version} &middot; Remaining Balance {formatCurrency(remaining)}</p>
        </motion.div>
      )}

      {record.payment.attempts.length > 0 && (
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Payment History</p>
          <div className="mt-2 flex flex-col divide-y divide-navy/10 rounded-2xl border border-navy/10">
            {record.payment.attempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-body text-sm font-semibold capitalize text-navy">{a.type} Payment</p>
                  <p className="font-body text-xs text-text-grey">
                    {a.methodLabel} &middot; {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {a.transactionId && ` · ${a.transactionId}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-body text-sm font-semibold text-navy">{formatCurrency(a.amount)}</p>
                  <p className={cn("font-body text-xs font-medium capitalize", a.status === "succeeded" ? "text-navy" : a.status === "failed" ? "text-destructive" : "text-orange")}>
                    {a.status === "succeeded" ? "Paid" : a.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlanChooser({
  snapshotTotal,
  plan,
  onSelectPlan,
  onContinue,
}: {
  snapshotTotal: number;
  plan: PaymentPlanType;
  onSelectPlan: (p: PaymentPlanType) => void;
  onContinue: () => void;
}) {
  const options = paymentPlanOptions(snapshotTotal);
  const selected = options.find((o) => o.id === plan)!;

  return (
    <>
      <div className="rounded-2xl border border-navy/10 p-6">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Approved Amount</p>
        <p className="mt-1 font-heading text-2xl font-bold text-navy">{formatCurrency(snapshotTotal)}</p>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Choose a Payment Plan</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelectPlan(o.id)}
              className={cn("flex-1 rounded-2xl border px-5 py-4 text-left transition-colors", plan === o.id ? "border-orange bg-orange/5" : "border-navy/15 hover:border-navy/30")}
            >
              <p className="font-body text-sm font-semibold text-navy">{o.label}</p>
              <p className="mt-0.5 font-body text-xs text-text-grey">{o.description}</p>
              <p className="mt-2 font-heading text-lg font-bold text-navy">{formatCurrency(o.amountDueNow)}</p>
              <p className="font-body text-xs text-text-grey">{o.remainingAfter > 0 ? `${formatCurrency(o.remainingAfter)} due later` : "Nothing due later"}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-navy/[0.02] px-6 py-4">
        <p className="font-body text-sm text-text-grey">Amount Due Now</p>
        <p className="font-heading text-xl font-bold text-navy">{formatCurrency(selected.amountDueNow)}</p>
        {selected.remainingAfter > 0 && <p className="font-body text-xs text-text-grey">{formatCurrency(selected.remainingAfter)} remaining, due before departure</p>}
      </div>

      <button type="button" onClick={onContinue} className="inline-flex w-fit items-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90">
        Continue to Payment Method
      </button>
    </>
  );
}

function PaymentMethodStep({
  tripName,
  amount,
  method,
  onSelectMethod,
  cardLast4,
  onCardLast4,
  onCancel,
  onPay,
  onSimulateFailure,
}: {
  tripName: string;
  amount: number;
  method: PaymentMethod;
  onSelectMethod: (m: PaymentMethod) => void;
  cardLast4: string;
  onCardLast4: (v: string) => void;
  onCancel: () => void;
  onPay: () => void;
  onSimulateFailure: () => void;
}) {
  const canPay = method !== "card" || cardLast4.length === 4;

  return (
    <>
      <div className="rounded-2xl border border-navy/10 p-6">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Trip</p>
        <p className="font-body text-sm font-semibold text-navy">{tripName}</p>
        <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
          <span className="font-body text-sm text-text-grey">Amount Due Now</span>
          <span className="font-heading text-xl font-bold text-navy">{formatCurrency(amount)}</span>
        </div>
      </div>

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Payment Method</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMethod(m.id)}
              className={cn("flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors", method === m.id ? "border-orange bg-orange/5" : "border-navy/15 hover:border-navy/30")}
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
            onChange={(e) => onCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Last 4 digits of card (test only)"
            inputMode="numeric"
            className="mt-3 w-full max-w-xs rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy placeholder:text-text-grey/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
        )}
        <p className="mt-2 font-body text-xs text-text-grey">This is a mock payment environment — no real transaction occurs, and no full card details are ever stored.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <motion.button
          type="button"
          whileHover={canPay ? { y: -1 } : undefined}
          whileTap={canPay ? { scale: 0.98 } : undefined}
          disabled={!canPay}
          onClick={onPay}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pay {formatCurrency(amount)}
        </motion.button>
        <button type="button" onClick={onSimulateFailure} className="font-body text-xs font-medium text-text-grey underline underline-offset-2 hover:text-destructive">
          Simulate a failed payment
        </button>
        <button type="button" onClick={onCancel} className="font-body text-xs font-medium text-text-grey hover:text-navy">
          Cancel
        </button>
      </div>
    </>
  );
}
