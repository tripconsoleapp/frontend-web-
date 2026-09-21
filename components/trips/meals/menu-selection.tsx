"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Copy, Flame, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { useTripContext } from "@/lib/use-trip-context";
import { Restaurant, getRestaurant } from "@/lib/mock-restaurant-catalog";
import { MealInstance, MealMenuSelection, getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import {
  aggregateResponses,
  generateToken,
  getGuestResponses,
  parseMealKey,
  saveSharedMeal,
  selectionsTotal,
} from "@/lib/meal-plan";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { MealContextHeader } from "./meal-context-header";

export function MenuSelection({ mealKey: key, template }: { mealKey: string; template?: string }) {
  const router = useRouter();
  const trip = useTripContext();
  const { dayIndex, mealType } = parseMealKey(key);
  const templateQuery = template ? `?template=${template}` : "";

  // sessionStorage/localStorage aren't available during SSR, so the first
  // paint must render a loading state and defer the real read to an effect
  // — the same pattern used throughout the transport/hotel flows.
  const [meal, setMeal] = useState<MealInstance | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [mode, setMode] = useState<"manual" | "group">("manual");
  const [selections, setSelections] = useState<MealMenuSelection[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    const draft = getServicesDraft();
    const found = draft.restaurant.meals.find((m) => m.dayIndex === dayIndex && m.mealType === mealType);
    if (!found || !found.restaurant) return;
    const rest = getRestaurant(found.restaurant.id);
    if (!rest) return;
    setMeal(found);
    setRestaurant(rest);
    setMode(found.planningMode === "group" ? "group" : "manual");
    setSelections(found.planningMode === "manual" ? found.selections : []);
    setActiveCategory(rest.menu[0]?.id ?? "");
    setShareToken(found.shareToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayIndex, mealType]);

  useEffect(() => {
    if (!shareToken) return;
    const tick = () => setResponseCount(getGuestResponses(shareToken).length);
    tick();
    const interval = setInterval(tick, 2000);
    return () => clearInterval(interval);
  }, [shareToken]);

  if (!meal || !restaurant) {
    return (
      <div className="flex flex-col gap-6">
        <MealContextHeader backHref={`/trips/create/services/restaurant${templateQuery}`} eyebrow="Menu" />
        <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  function persistMode(nextMode: "manual" | "group") {
    setMode(nextMode);
    const d = getServicesDraft();
    const next = d.restaurant.meals.map((m) =>
      m.dayIndex === dayIndex && m.mealType === mealType ? { ...m, planningMode: nextMode, status: "planning" as const } : m
    );
    saveServicesDraft({ ...d, restaurant: { ...d.restaurant, meals: next } });
  }

  function updateQuantity(itemId: string, itemName: string, price: number, quantity: number) {
    setSelections((current) => {
      const next =
        quantity <= 0
          ? current.filter((s) => s.itemId !== itemId)
          : (() => {
              const exists = current.find((s) => s.itemId === itemId);
              if (exists) return current.map((s) => (s.itemId === itemId ? { ...s, quantity } : s));
              return [...current, { itemId, itemName, price, quantity }];
            })();
      const d = getServicesDraft();
      const updated = d.restaurant.meals.map((m) =>
        m.dayIndex === dayIndex && m.mealType === mealType
          ? { ...m, selections: next, status: "planning" as const, total: selectionsTotal(next) }
          : m
      );
      saveServicesDraft({ ...d, restaurant: { ...d.restaurant, meals: updated } });
      return next;
    });
  }

  function handleGenerateLink() {
    if (!restaurant || !meal) return;
    const token = generateToken();
    saveSharedMeal({
      token,
      tripName: trip.tripName || "Your Trip",
      destinationName: meal.destinationName,
      dayIndex,
      mealType,
      restaurantName: restaurant.name,
      participantCount: trip.passengerCount,
      categories: restaurant.menu.map((c) => ({
        id: c.id,
        name: c.name,
        items: c.items.map((i) => ({ id: i.id, name: i.name, description: i.description, price: i.price, diet: i.diet })),
      })),
    });
    const d = getServicesDraft();
    const next = d.restaurant.meals.map((m) =>
      m.dayIndex === dayIndex && m.mealType === mealType ? { ...m, shareToken: token, planningMode: "group" as const, status: "planning" as const } : m
    );
    saveServicesDraft({ ...d, restaurant: { ...d.restaurant, meals: next } });
    setShareToken(token);
  }

  const shareUrl = shareToken && typeof window !== "undefined" ? `${window.location.origin}/meals/guest/${shareToken}` : "";

  function handleCopyLink() {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const total = selectionsTotal(selections);
  const itemCount = selections.reduce((sum, s) => sum + s.quantity, 0);
  const responses = shareToken ? getGuestResponses(shareToken) : [];
  const respondedCount = responses.length;
  const responsePct = trip.passengerCount > 0 ? Math.round((respondedCount / trip.passengerCount) * 100) : 0;
  const aggregated = aggregateResponses(responses);

  function handleReview() {
    router.push(`/trips/create/services/restaurant/${key}/review${templateQuery}`);
  }

  return (
    <div className="flex flex-col gap-6 pb-32 lg:pb-10">
      <MealContextHeader
        backHref={`/trips/create/services/restaurant/${key}/restaurant/${restaurant.id}${templateQuery}`}
        backLabel="Back to restaurant"
        eyebrow="Menu"
        meal={{ destinationName: meal.destinationName, dayIndex: meal.dayIndex, mealType: meal.mealType }}
      />

      <div>
        <h1 className="font-heading text-xl font-bold text-navy">{restaurant.name}</h1>
      </div>

      <SegmentedTabs
        options={[
          { value: "manual", label: "Manual Planning" },
          { value: "group", label: "Group Planning" },
        ]}
        value={mode}
        onChange={(v) => persistMode(v as "manual" | "group")}
      />

      {mode === "manual" ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-6">
            <div className="sticky top-0 z-10 -mx-1 flex gap-2 overflow-x-auto bg-[#FAF8F4] px-1 py-2">
              {restaurant.menu.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors",
                    activeCategory === cat.id ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {restaurant.menu.map((cat) => (
              <div key={cat.id} id={cat.id} className="flex flex-col gap-3">
                <h2 className="font-heading text-base font-semibold text-navy">{cat.name}</h2>
                {cat.items.map((menuItem) => {
                  const qty = selections.find((s) => s.itemId === menuItem.id)?.quantity ?? 0;
                  return (
                    <div key={menuItem.id} className="flex items-center gap-4 border-b border-navy/10 pb-4">
                      {menuItem.imageUrl && (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                          <Image src={menuItem.imageUrl} alt={menuItem.name} fill sizes="64px" className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-sm border", menuItem.diet === "veg" || menuItem.diet === "vegan" || menuItem.diet === "jain" ? "border-mint bg-mint" : "border-destructive bg-destructive")} />
                          <p className="font-body text-sm font-semibold text-navy">{menuItem.name}</p>
                          {menuItem.popular && <Star size={12} className="fill-orange text-orange" />}
                          {menuItem.spicy && <Flame size={12} className="text-orange" />}
                        </div>
                        <p className="mt-0.5 font-body text-xs text-text-grey">{menuItem.description}</p>
                        <p className="mt-0.5 font-body text-sm font-semibold text-navy">{formatCurrency(menuItem.price)}</p>
                      </div>
                      <div className="shrink-0">
                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => updateQuantity(menuItem.id, menuItem.name, menuItem.price, 1)}
                            className="rounded-full border border-orange px-4 py-1.5 font-body text-sm font-semibold text-orange transition-colors hover:bg-orange/10"
                          >
                            + Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 rounded-full bg-orange px-1 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(menuItem.id, menuItem.name, menuItem.price, qty - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-body text-sm font-bold text-orange"
                              aria-label={`Decrease ${menuItem.name}`}
                            >
                              −
                            </button>
                            <AnimatePresence mode="wait">
                              <motion.span
                                key={qty}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="w-4 text-center font-body text-sm font-semibold text-white"
                              >
                                {qty}
                              </motion.span>
                            </AnimatePresence>
                            <button
                              type="button"
                              onClick={() => updateQuantity(menuItem.id, menuItem.name, menuItem.price, qty + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-body text-sm font-bold text-orange"
                              aria-label={`Increase ${menuItem.name}`}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-8 rounded-2xl bg-navy/[0.02] p-5">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Your meal</p>
              <p className="mt-2 font-body text-sm text-navy">{trip.passengerCount} meals &middot; {itemCount} items</p>
              <div className="mt-3 flex items-center justify-between border-t border-navy/10 pt-3">
                <span className="font-body text-sm font-semibold text-navy">Total</span>
                <span className="font-heading text-lg font-bold text-navy">{formatCurrency(total)}</span>
              </div>
              <button
                type="button"
                disabled={itemCount === 0}
                onClick={handleReview}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Review Meal <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-navy/10 bg-white px-6 py-3 lg:hidden">
            <p className="font-body text-sm text-navy">
              {itemCount} items &middot; <span className="font-semibold">{formatCurrency(total)}</span>
            </p>
            <button
              type="button"
              disabled={itemCount === 0}
              onClick={handleReview}
              className="rounded-full bg-orange px-5 py-2.5 font-body text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Review Meal
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {!shareToken ? (
            <div className="rounded-2xl border border-navy/10 bg-white p-6">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                Day {dayIndex} {meal.mealType}
              </p>
              <h2 className="mt-1 font-heading text-lg font-semibold text-navy">{restaurant.name}</h2>
              <p className="font-body text-sm text-text-grey">{meal.destinationName}</p>
              <p className="mt-3 font-body text-sm text-navy">
                Each traveler picks their own dish via a shared link.
              </p>
              <button
                type="button"
                onClick={handleGenerateLink}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90"
              >
                Generate Share Link
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-navy/10 bg-white p-6">
                <p className="font-body text-sm font-semibold text-navy">Share with your group</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input readOnly value={shareUrl} className="flex-1 rounded-xl border border-navy/15 bg-navy/[0.03] px-3 py-2 font-body text-xs text-navy" />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-navy/20 px-4 py-2 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy Link"}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Choose your ${meal.mealType} at ${restaurant.name}: ${shareUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-mint/40 px-4 py-2 font-body text-sm font-semibold text-navy transition-colors hover:bg-mint/60"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-navy/10 bg-white p-6">
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Meal responses</p>
                <p className="mt-1 font-heading text-lg font-semibold text-navy">
                  {respondedCount} / {trip.passengerCount} responded
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
                  <motion.div className="h-full rounded-full bg-orange" animate={{ width: `${responsePct}%` }} transition={{ duration: 0.3 }} />
                </div>
                <p className="mt-1 font-body text-xs text-text-grey">{responsePct}%</p>
                {trip.passengerCount - respondedCount > 0 && (
                  <p className="mt-2 font-body text-sm text-text-grey">
                    {trip.passengerCount - respondedCount} haven&rsquo;t responded
                  </p>
                )}

                {aggregated.length > 0 && (
                  <div className="mt-4 flex flex-col gap-1.5 border-t border-navy/10 pt-4">
                    {aggregated.map((a) => (
                      <div key={a.itemId} className="flex items-center justify-between font-body text-sm text-navy">
                        <span>{a.itemName}</span>
                        <span className="font-semibold">{a.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  disabled={respondedCount === 0}
                  onClick={handleReview}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Review Responses <ArrowRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
