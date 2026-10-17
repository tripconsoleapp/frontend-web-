"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, Edit3 } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { MealInstance, MealMenuSelection, getBackendTripId, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { aggregateResponses, fitsGroup, getGuestResponses, parseMealKey, selectionsTotal } from "@/lib/meal-plan";
import { MealContextHeader } from "./meal-context-header";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { replaceMealService } from "@/lib/meal-service-api";
import { FormError } from "@/components/ui/form-error";

export function MealReview({ mealKey: key, template }: { mealKey: string; template?: string }) {
  const router = useRouter();
  const { dayIndex, mealType } = parseMealKey(key);
  const templateQuery = template ? `?template=${template}` : "";
  const { authedFetch } = useAuth();

  const [meal, setMeal] = useState<MealInstance | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const draft = getServicesDraft();
    setMeal(draft.restaurant.meals.find((m) => m.dayIndex === dayIndex && m.mealType === mealType) ?? null);
  }, [dayIndex, mealType]);

  if (!meal || !meal.restaurant) {
    return (
      <div className="flex flex-col gap-6">
        <MealContextHeader backHref={`/trips/create/services/restaurant${templateQuery}`} eyebrow="Review Meal" />
        <div className="h-32 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const isGroup = meal.planningMode === "group";
  const responses = isGroup && meal.shareToken ? getGuestResponses(meal.shareToken) : [];
  const finalSelections: MealMenuSelection[] = isGroup ? aggregateResponses(responses) : meal.selections;
  const total = selectionsTotal(finalSelections);
  const respondedCount = responses.length;
  const missing = isGroup ? Math.max(0, meal.participantCount - respondedCount) : 0;
  const fits = fitsGroup(meal.restaurant.capacity, meal.participantCount);
  const canConfirm = finalSelections.length > 0 && fits;

  async function handleConfirm() {
    if (!meal || !canConfirm) return;
    let confirmedMeal: MealInstance = { ...meal, status: "confirmed", selections: finalSelections, total };

    const backendTripId = getBackendTripId();
    if (backendTripId) {
      setSubmitting(true);
      setSyncError(null);
      try {
        // Reconfirming (same or a different restaurant/menu) never leaves
        // two live TripService rows for this meal — the prior one (if any)
        // is only removed once the new one is confirmed created. This is
        // demo/config persistence (see lib/meal-service-api.ts), never a
        // real booking.
        const backendId = await replaceMealService(backendTripId, meal.backendId, confirmedMeal, authedFetch);
        confirmedMeal = { ...confirmedMeal, backendId };
      } catch (err) {
        setSubmitting(false);
        setSyncError(
          err instanceof ApiError
            ? err.message
            : "Could not save this meal. Please try again."
        );
        // Never mark the meal confirmed locally when the backend rejected
        // it — the in-progress selection is left untouched so the organizer
        // can retry without re-picking dishes.
        return;
      }
      setSubmitting(false);
    }

    const draft = getServicesDraft();
    const next = draft.restaurant.meals.map((m) =>
      m.dayIndex === dayIndex && m.mealType === mealType ? confirmedMeal : m
    );
    saveServicesDraft({
      ...draft,
      restaurant: {
        ...draft.restaurant,
        meals: next,
        configured: next.every((m) => m.status === "confirmed" || m.status === "skipped"),
      },
    });
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/50 text-navy"
        >
          <Check size={26} />
        </motion.span>
        <h1 className="font-heading text-xl font-bold text-navy">Meal confirmed</h1>
        <p className="font-body text-sm text-text-grey">
          Day {meal.dayIndex} {mealType} &middot; {meal.restaurant.name}
        </p>
        <p className="font-body text-sm text-text-grey">
          {meal.participantCount} meals &middot; {formatCurrency(total)}
        </p>
        <button
          type="button"
          onClick={() => router.push(`/trips/create/services/restaurant${templateQuery}`)}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          Back to Meal Planning &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <MealContextHeader
        backHref={`/trips/create/services/restaurant/${key}/menu${templateQuery}`}
        backLabel="Back to menu"
        eyebrow="Review Meal"
        meal={{ destinationName: meal.destinationName, dayIndex: meal.dayIndex, mealType: meal.mealType }}
      />

      <div>
        <h1 className="font-heading text-xl font-bold text-navy">{meal.restaurant.name}</h1>
        <p className="mt-0.5 font-body text-sm text-text-grey">
          {meal.destinationName} &middot; {meal.participantCount} travelers
        </p>
      </div>

      {isGroup && missing > 0 && (
        <div className="rounded-xl bg-orange/10 px-4 py-3">
          <p className="font-body text-sm text-orange">
            {missing} traveler{missing === 1 ? "" : "s"} haven&rsquo;t submitted a meal choice. You can confirm with
            current responses, or wait for more.
          </p>
        </div>
      )}

      {!fits && (
        <div className="rounded-xl bg-destructive-soft px-4 py-3">
          <p className="font-body text-sm text-destructive">
            {meal.restaurant.name} may not accommodate your {meal.participantCount}-guest group (capacity{" "}
            {meal.restaurant.capacity}).
          </p>
          <button
            type="button"
            onClick={() => router.push(`/trips/create/services/restaurant/${key}/restaurants${templateQuery}`)}
            className="mt-1 font-body text-sm font-semibold text-navy underline underline-offset-2"
          >
            Choose another restaurant
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-navy/10 bg-white p-5">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Selections</p>
        <div className="mt-3 flex flex-col gap-2">
          {finalSelections.map((s) => (
            <div key={s.itemId} className="flex items-center justify-between font-body text-sm text-navy">
              <span>
                {s.itemName} &times; {s.quantity}
              </span>
              <span className="font-semibold">{formatCurrency(s.price * s.quantity)}</span>
            </div>
          ))}
          {finalSelections.length === 0 && <p className="font-body text-sm text-text-grey">No dishes selected yet.</p>}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
          <span className="font-body text-sm font-semibold text-navy">Total</span>
          <span className="font-heading text-lg font-bold text-navy">{formatCurrency(total)}</span>
        </div>
      </div>

      {syncError && <FormError message={syncError} />}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canConfirm || submitting}
          onClick={handleConfirm}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check size={15} /> {submitting ? "Saving..." : "Confirm Meal"}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => router.push(`/trips/create/services/restaurant/${key}/menu${templateQuery}`)}
          className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-navy underline underline-offset-2 transition-colors hover:text-orange disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Edit3 size={13} /> Edit Selection
        </button>
      </div>
    </div>
  );
}
