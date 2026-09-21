"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Sparkles, UtensilsCrossed, Wand2, X } from "lucide-react";
import { formatCurrency } from "@/lib/mock-trips";
import { getServicesDraft } from "@/lib/listing-draft";
import { ItineraryBlock } from "@/lib/listing-draft";
import { getHiddenGemsForDestination } from "@/lib/mock-activity-catalog";
import { MEAL_LABELS } from "@/lib/meal-plan";
import { MEAL_WINDOWS } from "@/lib/activity-plan";
import { generateBlockId } from "@/lib/itinerary";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { cn } from "@/lib/cn";

type Mode = "pick" | "activity" | "meal" | "hidden_gem" | "custom";

export function AddBlockDrawer({
  open,
  destinationId,
  date,
  dayIndex,
  existingActivitySourceIds,
  existingMealSourceIds,
  onClose,
  onAdd,
}: {
  open: boolean;
  destinationId: string;
  date: string;
  dayIndex: number;
  existingActivitySourceIds: string[];
  existingMealSourceIds: string[];
  onClose: () => void;
  onAdd: (block: ItineraryBlock) => void;
}) {
  const isDesktop = useIsDesktop();
  const [mode, setMode] = useState<Mode>("pick");
  const [customTitle, setCustomTitle] = useState("");
  const [customStart, setCustomStart] = useState("15:00");
  const [customEnd, setCustomEnd] = useState("16:00");
  const [gemStart, setGemStart] = useState("15:30");

  const draft = getServicesDraft();
  const availableActivities = useMemo(() => {
    const dest = draft.activities.destinations.find((d) => d.destinationId === destinationId);
    return (dest?.activities ?? []).filter((a) => a.date === date && !existingActivitySourceIds.includes(a.id));
  }, [draft, destinationId, date, existingActivitySourceIds]);

  const availableMeals = useMemo(
    () =>
      draft.restaurant.meals.filter(
        (m) => m.dayIndex === dayIndex && m.status === "confirmed" && !existingMealSourceIds.includes(`${m.dayIndex}-${m.mealType}`)
      ),
    [draft, dayIndex, existingMealSourceIds]
  );

  const gems = useMemo(() => getHiddenGemsForDestination(destinationId), [destinationId]);

  function close() {
    setMode("pick");
    setCustomTitle("");
    onClose();
  }

  function addActivity(activityId: string) {
    const dest = draft.activities.destinations.find((d) => d.destinationId === destinationId);
    const a = dest?.activities.find((x) => x.id === activityId);
    if (!a) return;
    onAdd({
      id: generateBlockId(),
      type: "activity",
      title: a.name,
      subtitle: `${a.durationHours} ${a.durationHours === 1 ? "hour" : "hours"}`,
      destinationId,
      date,
      startTime: a.startTime,
      endTime: a.endTime,
      imageUrl: a.imageUrl,
      sourceType: "activity",
      sourceId: a.id,
      participants: a.participants,
      price: a.total,
      locked: true,
    });
    close();
  }

  function addMeal(mealKey: string) {
    const meal = draft.restaurant.meals.find((m) => `${m.dayIndex}-${m.mealType}` === mealKey);
    if (!meal) return;
    const [start, end] = MEAL_WINDOWS[meal.mealType];
    onAdd({
      id: generateBlockId(),
      type: "meal",
      title: MEAL_LABELS[meal.mealType],
      subtitle: meal.restaurant?.name,
      destinationId,
      date,
      startTime: start,
      endTime: end,
      imageUrl: meal.restaurant?.imageUrl,
      sourceType: "meal",
      sourceId: mealKey,
      participants: meal.participantCount,
      price: meal.total,
      locked: true,
    });
    close();
  }

  function addGem(gemId: string) {
    const gem = gems.find((g) => g.id === gemId);
    if (!gem) return;
    const minutes = gem.durationLabel.includes("hour") ? 60 : parseInt(gem.durationLabel) || 30;
    const [h, m] = gemStart.split(":").map(Number);
    const endTotal = h * 60 + m + minutes;
    const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;
    onAdd({
      id: generateBlockId(),
      type: "hidden_gem",
      title: gem.name,
      subtitle: `${gem.type} · ${gem.durationLabel}`,
      destinationId,
      date,
      startTime: gemStart,
      endTime,
      imageUrl: gem.imageUrl,
      sourceType: "hiddenGem",
      sourceId: gem.id,
      locked: false,
    });
    close();
  }

  function addCustom() {
    if (!customTitle.trim()) return;
    onAdd({
      id: generateBlockId(),
      type: "custom",
      title: customTitle.trim(),
      destinationId,
      date,
      startTime: customStart,
      endTime: customEnd,
      locked: false,
    });
    close();
  }

  const panelMotion = isDesktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] flex items-stretch justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 bg-navy/50" />
          <motion.div
            {...panelMotion}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative z-10 flex w-full flex-col overflow-hidden bg-white shadow-xl", isDesktop ? "h-full max-w-md rounded-l-2xl" : "mt-auto max-h-[85vh] rounded-t-2xl")}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                {mode !== "pick" && (
                  <button type="button" onClick={() => setMode("pick")} aria-label="Back" className="text-text-grey hover:text-navy">
                    <ArrowLeft size={16} />
                  </button>
                )}
                <h2 className="font-heading text-xl font-semibold text-navy">Add to Day</h2>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-text-grey transition-colors hover:bg-navy/5 hover:text-navy">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6">
              {mode === "pick" && (
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => setMode("activity")} className="flex items-center gap-3 rounded-xl border border-navy/10 px-4 py-3 text-left transition-colors hover:border-orange/40">
                    <Sparkles size={16} className="text-orange" /> <span className="font-body text-sm font-medium text-navy">Activity</span>
                  </button>
                  <button type="button" onClick={() => setMode("meal")} className="flex items-center gap-3 rounded-xl border border-navy/10 px-4 py-3 text-left transition-colors hover:border-orange/40">
                    <UtensilsCrossed size={16} className="text-orange" /> <span className="font-body text-sm font-medium text-navy">Meal</span>
                  </button>
                  <button type="button" onClick={() => setMode("hidden_gem")} className="flex items-center gap-3 rounded-xl border border-navy/10 px-4 py-3 text-left transition-colors hover:border-orange/40">
                    <Sparkles size={16} className="text-navy" /> <span className="font-body text-sm font-medium text-navy">Hidden Gem</span>
                  </button>
                  <button type="button" onClick={() => setMode("custom")} className="flex items-center gap-3 rounded-xl border border-navy/10 px-4 py-3 text-left transition-colors hover:border-orange/40">
                    <Wand2 size={16} className="text-orange" /> <span className="font-body text-sm font-medium text-navy">Custom</span>
                  </button>
                  <p className="mt-1 font-body text-xs text-text-grey">
                    Travel is generated automatically from your route and vehicle — edit its time from the block itself.
                  </p>
                </div>
              )}

              {mode === "activity" && (
                <div className="flex flex-col gap-2">
                  {availableActivities.length === 0 && (
                    <p className="font-body text-sm text-text-grey">
                      No configured activities are available for this day. Add one from Services &rarr; Activities first.
                    </p>
                  )}
                  {availableActivities.map((a) => (
                    <button key={a.id} type="button" onClick={() => addActivity(a.id)} className="flex items-center justify-between gap-3 rounded-xl border border-navy/10 px-4 py-3 text-left transition-colors hover:border-orange/40">
                      <div>
                        <p className="font-body text-sm font-semibold text-navy">{a.name}</p>
                        <p className="font-body text-xs text-text-grey">{a.startTime} &middot; {a.durationHours}h</p>
                      </div>
                      <span className="font-body text-sm font-semibold text-navy">{formatCurrency(a.total)}</span>
                    </button>
                  ))}
                </div>
              )}

              {mode === "meal" && (
                <div className="flex flex-col gap-2">
                  {availableMeals.length === 0 && (
                    <p className="font-body text-sm text-text-grey">
                      No confirmed meals are available for this day. Plan one from Services &rarr; Restaurant first.
                    </p>
                  )}
                  {availableMeals.map((m) => (
                    <button key={`${m.dayIndex}-${m.mealType}`} type="button" onClick={() => addMeal(`${m.dayIndex}-${m.mealType}`)} className="flex items-center justify-between gap-3 rounded-xl border border-navy/10 px-4 py-3 text-left transition-colors hover:border-orange/40">
                      <div>
                        <p className="font-body text-sm font-semibold text-navy">{MEAL_LABELS[m.mealType]}</p>
                        <p className="font-body text-xs text-text-grey">{m.restaurant?.name}</p>
                      </div>
                      <span className="font-body text-sm font-semibold text-navy">{formatCurrency(m.total)}</span>
                    </button>
                  ))}
                </div>
              )}

              {mode === "hidden_gem" && (
                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-between gap-3 font-body text-sm text-navy">
                    Start time
                    <input type="time" value={gemStart} onChange={(e) => setGemStart(e.target.value)} className="rounded-lg border border-navy/15 px-3 py-1.5 font-body text-sm text-navy" />
                  </label>
                  {gems.length === 0 && <p className="font-body text-sm text-text-grey">No hidden gems catalogued near this destination.</p>}
                  {gems.map((g) => (
                    <button key={g.id} type="button" onClick={() => addGem(g.id)} className="flex items-center gap-3 rounded-xl border border-navy/10 px-4 py-3 text-left transition-colors hover:border-mint">
                      <div>
                        <p className="font-body text-sm font-semibold text-navy">{g.name}</p>
                        <p className="font-body text-xs text-text-grey">{g.type} &middot; {g.durationLabel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {mode === "custom" && (
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1 font-body text-sm text-navy">
                    Title
                    <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="e.g. Souvenir shopping" className="rounded-lg border border-navy/15 px-3 py-2 font-body text-sm text-navy" />
                  </label>
                  <div className="flex gap-3">
                    <label className="flex flex-1 flex-col gap-1 font-body text-sm text-navy">
                      Start
                      <input type="time" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="rounded-lg border border-navy/15 px-3 py-2 font-body text-sm text-navy" />
                    </label>
                    <label className="flex flex-1 flex-col gap-1 font-body text-sm text-navy">
                      End
                      <input type="time" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="rounded-lg border border-navy/15 px-3 py-2 font-body text-sm text-navy" />
                    </label>
                  </div>
                  <button type="button" onClick={addCustom} disabled={!customTitle.trim()} className="rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40">
                    Add Custom Block
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
