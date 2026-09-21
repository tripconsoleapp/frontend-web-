"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, ArrowRight, Info, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/mock-trips";
import { ItineraryBlock, ItineraryDay, ItineraryDraft, getItineraryDraft, saveItineraryDraft } from "@/lib/listing-draft";
import { dayPlannedMinutes, dayTotalCost, moveBlock, recomputeDay, toMinutes } from "@/lib/itinerary";
import { getHiddenGemsForDestination } from "@/lib/mock-activity-catalog";
import { ItineraryContextHeader } from "./itinerary-context-header";
import { TimelineBlock } from "./timeline-block";
import { AddBlockDrawer } from "./add-block-drawer";
import { EditBlockDrawer } from "./edit-block-drawer";

function formatDayDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", day: "numeric", weekday: "long" });
}

export function DayEditor({ dayIndex, template }: { dayIndex: number; template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const templateQuery = template ? `?template=${template}` : "";

  const [itinerary, setItinerary] = useState<ItineraryDraft | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ItineraryBlock | null>(null);

  useEffect(() => {
    setItinerary(getItineraryDraft());
  }, []);

  if (!itinerary) {
    return (
      <div className="flex flex-col gap-6">
        <ItineraryContextHeader backHref={`/trips/create/itinerary/overview${templateQuery}`} eyebrow="Itinerary" />
        <div className="h-40 animate-pulse rounded-2xl bg-navy/[0.04]" />
      </div>
    );
  }

  const day = itinerary.days.find((d) => d.dayIndex === dayIndex);
  if (!day) {
    return (
      <div className="flex flex-col gap-6">
        <ItineraryContextHeader backHref={`/trips/create/itinerary/overview${templateQuery}`} eyebrow="Itinerary" />
        <p className="font-body text-sm text-text-grey">Day {dayIndex} wasn&rsquo;t found in this itinerary.</p>
      </div>
    );
  }

  function persist(nextDay: ItineraryDay) {
    const nextDays = itinerary!.days.map((d) => (d.dayIndex === nextDay.dayIndex ? nextDay : d));
    const next = { ...itinerary!, days: nextDays };
    saveItineraryDraft(next);
    setItinerary(next);
  }

  function handleAdd(block: ItineraryBlock) {
    persist(recomputeDay({ ...day!, blocks: [...day!.blocks, block] }));
  }

  function handleRemove(blockId: string) {
    persist(recomputeDay({ ...day!, blocks: day!.blocks.filter((b) => b.id !== blockId) }));
  }

  function handleSaveSchedule(blockId: string, patch: { title?: string; startTime: string; endTime: string }) {
    const nextBlocks = day!.blocks.map((b) => (b.id === blockId ? { ...b, ...(patch.title ? { title: patch.title } : {}), startTime: patch.startTime, endTime: patch.endTime } : b));
    persist(recomputeDay({ ...day!, blocks: nextBlocks }));
  }

  function handleMove(blockId: string, direction: "earlier" | "later") {
    persist(moveBlock(day!, blockId, direction));
  }

  const orderedForTimeline = [...day.blocks.filter((b) => b.type !== "stay")].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  const stayBlocks = day.blocks.filter((b) => b.type === "stay");
  const timedNonFree = orderedForTimeline.filter((b) => b.type !== "free_time");
  const errorCount = day.conflicts.filter((c) => c.level === "error").length;
  const warningCount = day.conflicts.filter((c) => c.level === "warning").length;

  const existingActivitySourceIds = day.blocks.filter((b) => b.type === "activity").map((b) => b.sourceId!).filter(Boolean);
  const existingMealSourceIds = day.blocks.filter((b) => b.type === "meal").map((b) => b.sourceId!).filter(Boolean);

  // Contextual hidden-gem suggestion: only surface it for a genuinely large
  // gap (>=2 hours) at a destination that actually has catalogued gems —
  // never forced, never randomly generated.
  const bigGap = orderedForTimeline.find((b) => b.type === "free_time" && toMinutes(b.endTime) - toMinutes(b.startTime) >= 120);
  const suggestedGem = bigGap ? getHiddenGemsForDestination(day.destinationId)[0] : undefined;
  const gapHours = bigGap ? Math.round(((toMinutes(bigGap.endTime) - toMinutes(bigGap.startTime)) / 60) * 10) / 10 : 0;

  return (
    <div className="flex flex-col gap-6 pb-32 lg:pb-10">
      <ItineraryContextHeader backHref={`/trips/create/itinerary/overview${templateQuery}`} backLabel="Back to overview" eyebrow="Itinerary" />

      <div className="flex gap-2 overflow-x-auto">
        {itinerary.days.map((d) => (
          <button
            key={d.dayIndex}
            type="button"
            onClick={() => router.push(`/trips/create/itinerary/day/${d.dayIndex}${templateQuery}`)}
            className={cn(
              "flex shrink-0 flex-col items-start gap-0.5 rounded-xl border px-4 py-2 text-left transition-colors",
              d.dayIndex === dayIndex ? "border-orange bg-orange/10" : "border-navy/10 bg-white hover:border-navy/25"
            )}
          >
            <span className={cn("font-body text-sm font-semibold", d.dayIndex === dayIndex ? "text-orange" : "text-navy")}>Day {d.dayIndex}</span>
            <span className="font-body text-xs text-text-grey">{d.destinationName}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <motion.div key={dayIndex} initial={shouldReduce ? undefined : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="flex flex-col gap-2">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Day {day.dayIndex}</p>
            <h1 className="font-heading text-xl font-bold text-navy">{formatDayDate(day.date)}</h1>
            <p className="font-body text-sm text-text-grey">{day.destinationName}</p>
          </div>

          {day.conflicts.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              {day.conflicts.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "flex items-start gap-2 rounded-xl px-4 py-2.5 font-body text-sm",
                    c.level === "error" ? "bg-destructive-soft text-destructive" : "bg-orange/10 text-orange"
                  )}
                >
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {c.message}
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex flex-col divide-y divide-navy/10">
            {timedNonFree.length === 0 && !bigGap && (
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-14 text-center">
                <p className="font-heading text-base font-semibold text-navy">No activities or meals planned yet.</p>
                <button type="button" onClick={() => setAddOpen(true)} className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90">
                  <Plus size={14} /> Add Block
                </button>
              </div>
            )}

            <AnimatePresence initial={false}>
              {orderedForTimeline.map((block, index) => {
                const isTimed = block.type !== "free_time";
                const timedIndex = orderedForTimeline.filter((b) => b.type !== "free_time").indexOf(block);
                const timedCount = orderedForTimeline.filter((b) => b.type !== "free_time").length;
                return (
                  <div key={block.id}>
                    <TimelineBlock
                      block={block}
                      canMoveEarlier={isTimed && timedIndex > 0}
                      canMoveLater={isTimed && timedIndex < timedCount - 1}
                      onMoveEarlier={() => handleMove(block.id, "earlier")}
                      onMoveLater={() => handleMove(block.id, "later")}
                      onEdit={() => setEditingBlock(block)}
                      onRemove={() => handleRemove(block.id)}
                    />
                    {block === bigGap && suggestedGem && (
                      <div className="mb-4 rounded-2xl bg-navy/[0.03] p-4">
                        <p className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-navy">
                          <Sparkles size={12} /> Nearby hidden gem
                        </p>
                        <p className="mt-1 font-body text-sm text-navy/80">
                          You have {gapHours} {gapHours === 1 ? "hour" : "hours"} free in {day.destinationName}.
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                            <Image src={suggestedGem.imageUrl} alt={suggestedGem.name} fill sizes="48px" className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-body text-sm font-semibold text-navy">{suggestedGem.name}</p>
                            <p className="font-body text-xs text-text-grey">{suggestedGem.distanceLabel} &middot; {suggestedGem.durationLabel}</p>
                          </div>
                          <button type="button" onClick={() => setAddOpen(true)} className="shrink-0 rounded-full border border-navy/20 px-3.5 py-1.5 font-body text-xs font-semibold text-navy transition-colors hover:border-orange hover:text-orange">
                            Add to itinerary
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </AnimatePresence>

            {stayBlocks.map((b) => (
              <TimelineBlock key={b.id} block={b} canMoveEarlier={false} canMoveLater={false} onMoveEarlier={() => {}} onMoveLater={() => {}} onEdit={() => {}} onRemove={() => {}} />
            ))}
          </div>

          {timedNonFree.length > 0 && (
            <button type="button" onClick={() => setAddOpen(true)} className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-navy/20 px-4 py-3 font-body text-sm font-medium text-navy transition-colors hover:border-orange hover:bg-orange/5 hover:text-orange">
              <Plus size={14} /> Add Block
            </button>
          )}
        </motion.div>

        <div className="hidden lg:block">
          <div className="sticky top-8 flex flex-col gap-4 rounded-2xl bg-navy/[0.02] p-5">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Destination</p>
              <p className="font-body text-sm font-semibold text-navy">{day.destinationName}</p>
            </div>
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Day duration</p>
              <p className="font-body text-sm text-navy">{Math.round((dayPlannedMinutes(day) / 60) * 10) / 10} hrs planned</p>
            </div>
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Estimated cost</p>
              <p className="font-heading text-lg font-bold text-navy">{formatCurrency(dayTotalCost(day))}</p>
            </div>
            {day.conflicts.length === 0 ? (
              <p className="flex items-center gap-1.5 font-body text-xs text-navy/60">
                <Info size={12} /> No conflicts on this day.
              </p>
            ) : (
              <p className={cn("flex items-center gap-1.5 font-body text-xs", errorCount > 0 ? "text-destructive" : "text-orange")}>
                <AlertTriangle size={12} /> {errorCount > 0 ? `${errorCount} conflict${errorCount === 1 ? "" : "s"}` : `${warningCount} warning${warningCount === 1 ? "" : "s"}`}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-navy/10 bg-white px-6 py-3 lg:hidden">
        <span className="font-body text-sm font-semibold text-navy">{formatCurrency(dayTotalCost(day))}</span>
        <button type="button" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 font-body text-sm font-semibold text-white">
          <Plus size={14} /> Add Block
        </button>
      </div>

      <div className="hidden justify-end lg:flex">
        <button type="button" onClick={() => router.push(`/trips/create/itinerary/review${templateQuery}`)} className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-navy underline underline-offset-2 hover:text-orange">
          Continue to Review <ArrowRight size={14} />
        </button>
      </div>

      <AddBlockDrawer
        open={addOpen}
        destinationId={day.destinationId}
        date={day.date}
        dayIndex={day.dayIndex}
        existingActivitySourceIds={existingActivitySourceIds as string[]}
        existingMealSourceIds={existingMealSourceIds as string[]}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />
      <EditBlockDrawer block={editingBlock} onClose={() => setEditingBlock(null)} onSave={handleSaveSchedule} onRemove={handleRemove} />
    </div>
  );
}
