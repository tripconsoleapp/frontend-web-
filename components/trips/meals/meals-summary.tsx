"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Check, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { MealInstance, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { MEAL_LABELS, MEAL_TYPES, mealCounts, mealKey, mealPlanTotal } from "@/lib/meal-plan";
import { MealContextHeader } from "./meal-context-header";

export function MealsSummary({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const templateQuery = template ? `?template=${template}` : "";

  const [meals, setMeals] = useState<MealInstance[] | null>(null);

  useEffect(() => {
    setMeals(getServicesDraft().restaurant.meals);
  }, []);

  if (!meals) {
    return (
      <div className="flex flex-col gap-6">
        <MealContextHeader backHref={`/trips/create/services/restaurant${templateQuery}`} eyebrow="Meals Summary" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const total = mealPlanTotal(meals);
  const counts = mealCounts(meals);
  const dayIndices = Array.from(new Set(meals.map((m) => m.dayIndex))).sort((a, b) => a - b);

  function handleContinue() {
    const draft = getServicesDraft();
    saveServicesDraft({ ...draft, restaurant: { ...draft.restaurant, configured: true } });
    router.push(`/trips/create/services${templateQuery}`);
  }

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } } };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <MealContextHeader backHref={`/trips/create/services/restaurant${templateQuery}`} eyebrow="Meals Summary" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Meals Summary</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Total Meal Cost</p>
        <p className="font-heading text-3xl font-bold text-navy">{formatCurrency(total)}</p>
      </div>

      {counts.remaining > 0 && (
        <div className="rounded-xl bg-orange/10 px-4 py-3">
          <p className="font-body text-sm text-orange">
            {counts.remaining} meal{counts.remaining === 1 ? "" : "s"} still need{counts.remaining === 1 ? "s" : ""} a decision.
          </p>
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {dayIndices.map((dayIndex) => {
          const dayMeals = MEAL_TYPES.map((mt) => meals.find((m) => m.dayIndex === dayIndex && m.mealType === mt)).filter(
            (m): m is MealInstance => Boolean(m)
          );
          const destinationName = dayMeals[0]?.destinationName ?? "";
          return (
            <motion.div key={dayIndex} variants={item} className="flex flex-col gap-2">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                Day {dayIndex} &mdash; {destinationName}
              </p>
              <div className="flex flex-col gap-2">
                {dayMeals.map((m) => (
                  <div key={m.mealType} className="flex items-center justify-between gap-3 rounded-xl border border-navy/10 bg-white px-4 py-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span
                        className={
                          m.status === "confirmed"
                            ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/60 text-navy"
                            : m.status === "skipped"
                              ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy/5 text-text-grey"
                              : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-navy/20"
                        }
                      >
                        {m.status === "confirmed" ? <Check size={11} /> : m.status === "skipped" ? <Minus size={11} /> : null}
                      </span>
                      <div className="min-w-0">
                        <p className="font-body text-sm font-semibold text-navy">{MEAL_LABELS[m.mealType]}</p>
                        <p className="font-body text-sm text-text-grey">
                          {m.status === "confirmed" && m.restaurant
                            ? m.restaurant.name
                            : m.status === "skipped"
                              ? "Meal skipped"
                              : "Not planned"}
                        </p>
                        {m.status === "confirmed" && (
                          <p className="font-body text-xs text-text-grey/70">{m.participantCount} meals</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {m.status === "confirmed" && <p className="font-body text-sm font-semibold text-navy">{formatCurrency(m.total)}</p>}
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            m.status === "confirmed"
                              ? `/trips/create/services/restaurant/${mealKey(m.dayIndex, m.mealType)}/menu${templateQuery}`
                              : `/trips/create/services/restaurant/${mealKey(m.dayIndex, m.mealType)}/restaurants${templateQuery}`
                          )
                        }
                        className="font-body text-sm font-semibold text-orange underline underline-offset-2"
                      >
                        {m.status === "confirmed" ? "Change" : m.status === "skipped" ? "Add" : "Plan"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="flex flex-col gap-3 rounded-2xl bg-navy/[0.02] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-sm text-text-grey">
          {counts.confirmed} confirmed &middot; {counts.skipped} skipped
        </p>
        <button
          type="button"
          disabled={counts.remaining > 0}
          onClick={handleContinue}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to Services <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
