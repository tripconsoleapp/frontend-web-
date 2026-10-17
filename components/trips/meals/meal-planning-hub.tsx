"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, Check, Minus, UtensilsCrossed } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { MealInstance, getBackendTripId, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { MEAL_LABELS, MEAL_TYPES, computeTripDays, mealCounts, mealKey, reconcileMeals } from "@/lib/meal-plan";
import { MealContextHeader } from "./meal-context-header";
import { DayNavigator } from "./day-navigator";
import { SkipMealDialog } from "./skip-meal-dialog";
import { useAuth } from "@/lib/auth-context";
import { mealServicesToInstancePatches, type BackendTripService } from "@/lib/meal-service-api";

export function MealPlanningHub({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const trip = useTripContext();
  const { authedFetch } = useAuth();
  const templateQuery = template ? `?template=${template}` : "";
  const backHref = `/trips/create/services${templateQuery}`;

  const [meals, setMeals] = useState<MealInstance[] | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [skipTarget, setSkipTarget] = useState<MealInstance | null>(null);

  useEffect(() => {
    if (!trip.ready) return;
    let cancelled = false;
    (async () => {
      const draft = getServicesDraft();
      const days = computeTripDays(trip.stops);
      let reconciled = reconcileMeals(draft.restaurant.meals, days, trip.passengerCount);

      // Backend is authoritative once a real trip exists — recover any
      // confirmed meals already persisted there (e.g. after a refresh
      // cleared sessionStorage) and let them override the local copy.
      const backendTripId = getBackendTripId();
      if (backendTripId) {
        try {
          const backendTrip = await authedFetch<{ services: BackendTripService[] }>(
            `/trips/${backendTripId}`
          );
          const patches = mealServicesToInstancePatches(backendTrip.services ?? []);
          if (patches.size > 0) {
            reconciled = reconciled.map((m) => patches.get(`${m.dayIndex}-${m.mealType}`) ?? m);
          }
        } catch {
          // Non-fatal — the organizer just continues with the local/route-
          // derived list; a subsequent confirm still reports its own
          // success/failure.
        }
      }

      if (cancelled) return;
      saveServicesDraft({
        ...draft,
        restaurant: {
          ...draft.restaurant,
          meals: reconciled,
          configured: reconciled.length > 0 && reconciled.every((m) => m.status === "confirmed" || m.status === "skipped"),
        },
      });
      setMeals(reconciled);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.ready]);

  const days = computeTripDays(trip.stops);

  if (!meals) {
    return (
      <div className="flex flex-col gap-6">
        <MealContextHeader backHref={backHref} eyebrow="Services · Meal Planning" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <MealContextHeader backHref={backHref} eyebrow="Services · Meal Planning" />
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-14 text-center">
          <UtensilsCrossed size={22} className="text-navy/40" />
          <p className="font-heading text-base font-semibold text-navy">No days to plan meals for yet.</p>
          <p className="max-w-sm font-body text-sm text-text-grey">
            Add a destination with at least one night in the Destinations step to start planning meals.
          </p>
        </div>
      </div>
    );
  }

  const counts = mealCounts(meals);
  const dayMeals = MEAL_TYPES.map((mt) => meals.find((m) => m.dayIndex === activeDay && m.mealType === mt)!);
  const activeDestination = days.find((d) => d.dayIndex === activeDay)?.destinationName ?? "";

  function persist(next: MealInstance[]) {
    const draft = getServicesDraft();
    saveServicesDraft({
      ...draft,
      restaurant: {
        ...draft.restaurant,
        meals: next,
        configured: next.length > 0 && next.every((m) => m.status === "confirmed" || m.status === "skipped"),
      },
    });
    setMeals(next);
  }

  function goToRestaurants(meal: MealInstance) {
    router.push(`/trips/create/services/restaurant/${mealKey(meal.dayIndex, meal.mealType)}/restaurants${templateQuery}`);
  }

  function confirmSkip() {
    if (!skipTarget || !meals) return;
    const next = meals.map((m) =>
      m.dayIndex === skipTarget.dayIndex && m.mealType === skipTarget.mealType
        ? { ...m, status: "skipped" as const, restaurant: null, planningMode: null, selections: [], responses: [], shareToken: null, total: 0 }
        : m
    );
    persist(next);
    setSkipTarget(null);
  }

  function undoSkip(meal: MealInstance) {
    if (!meals) return;
    const next = meals.map((m) =>
      m.dayIndex === meal.dayIndex && m.mealType === meal.mealType ? { ...m, status: "pending" as const } : m
    );
    persist(next);
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

  const progressPct = counts.total > 0 ? Math.round(((counts.confirmed + counts.skipped) / counts.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <MealContextHeader backHref={backHref} eyebrow="Services · Meal Planning" />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">Meal Planning</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          {activeDestination} &middot; Day {activeDay} &middot; {trip.passengerCount} travelers
        </p>
      </div>

      <DayNavigator days={days} activeDay={activeDay} onSelect={setActiveDay} />

      <motion.div
        key={activeDay}
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {dayMeals.map((meal) => (
          <motion.div key={meal.mealType} variants={item}>
            <MealSlotCard meal={meal} onChoose={() => goToRestaurants(meal)} onSkip={() => setSkipTarget(meal)} onUndo={() => undoSkip(meal)} />
          </motion.div>
        ))}
      </motion.div>

      <div className="flex flex-col gap-3 rounded-2xl bg-navy/[0.02] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="font-body text-sm text-text-grey">
            {counts.confirmed} confirmed &middot; {counts.skipped} skipped &middot;{" "}
            <span className={counts.remaining > 0 ? "font-medium text-orange" : ""}>{counts.remaining} remaining</span>
          </p>
          <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-navy/10">
            <motion.div
              className="h-full rounded-full bg-orange"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: shouldReduce ? 0 : 0.35 }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/trips/create/services/restaurant/summary${templateQuery}`)}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          View Meals Summary <ArrowRight size={14} />
        </button>
      </div>

      <SkipMealDialog
        open={Boolean(skipTarget)}
        mealType={skipTarget?.mealType ?? "breakfast"}
        destinationName={skipTarget?.destinationName ?? ""}
        onConfirm={confirmSkip}
        onCancel={() => setSkipTarget(null)}
      />
    </div>
  );
}

function MealSlotCard({
  meal,
  onChoose,
  onSkip,
  onUndo,
}: {
  meal: MealInstance;
  onChoose: () => void;
  onSkip: () => void;
  onUndo: () => void;
}) {
  const label = MEAL_LABELS[meal.mealType];

  if (meal.status === "confirmed" || meal.status === "planning" || meal.status === "restaurant_selected") {
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
        <div className="relative h-28 w-full overflow-hidden">
          {meal.restaurant && (
            <Image src={meal.restaurant.imageUrl} alt={meal.restaurant.name} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">{label}</p>
          <p className="font-heading text-sm font-semibold text-navy">{meal.restaurant?.name ?? "Restaurant selected"}</p>
          {meal.status === "confirmed" ? (
            <>
              <p className="font-body text-xs text-text-grey">
                {meal.participantCount} meals &middot; {formatCurrency(meal.total)}
              </p>
              <span className="mt-1 flex w-fit items-center gap-1 rounded-full bg-mint/30 px-2 py-0.5 font-body text-[11px] font-medium text-navy">
                <Check size={11} /> Confirmed
              </span>
            </>
          ) : (
            <p className="font-body text-xs text-orange">In progress &mdash; menu not finalized</p>
          )}
          <button
            type="button"
            onClick={onChoose}
            className="mt-auto pt-2 text-left font-body text-xs font-semibold text-orange underline underline-offset-2"
          >
            {meal.status === "confirmed" ? "Change →" : "Continue planning →"}
          </button>
        </div>
      </div>
    );
  }

  if (meal.status === "skipped") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-navy/15 bg-navy/[0.02] p-4">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">{label}</p>
        <p className="flex items-center gap-1.5 font-body text-sm text-text-grey">
          <Minus size={13} /> Meal skipped
        </p>
        <p className="font-body text-xs text-text-grey/70">No arrangement required</p>
        <div className="mt-auto flex items-center gap-3 pt-2">
          <button type="button" onClick={onChoose} className="font-body text-xs font-semibold text-orange underline underline-offset-2">
            Plan meal
          </button>
          <button type="button" onClick={onUndo} className="font-body text-xs font-medium text-text-grey underline underline-offset-2">
            Undo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-navy/10 bg-white p-4">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">{label}</p>
      <p className="font-body text-sm text-navy">No restaurant selected</p>
      <p className="font-body text-xs text-text-grey">Plan {label.toLowerCase()} for your group</p>
      <button
        type="button"
        onClick={onChoose}
        className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-orange px-4 py-2 font-body text-xs font-semibold text-white transition-colors hover:bg-orange/90"
      >
        Choose Restaurant <ArrowRight size={12} />
      </button>
      <button type="button" onClick={onSkip} className="mt-auto pt-1 text-left font-body text-xs font-medium text-text-grey underline underline-offset-2 hover:text-navy">
        Skip this meal
      </button>
    </div>
  );
}
