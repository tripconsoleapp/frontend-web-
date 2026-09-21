"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { ItineraryBlock } from "@/lib/listing-draft";
import { useIsDesktop } from "@/lib/use-is-desktop";
import { cn } from "@/lib/cn";

const SERVICE_LINK: Partial<Record<ItineraryBlock["type"], (block: ItineraryBlock) => string>> = {
  activity: (b) => `/trips/create/services/activities/${b.destinationId}/plan`,
  meal: (b) => `/trips/create/services/restaurant/${b.sourceId}/menu`,
  travel: () => `/trips/create/services/vehicle`,
  check_in: () => `/trips/create/services/hotel`,
  check_out: () => `/trips/create/services/hotel`,
};

const SERVICE_LINK_LABEL: Partial<Record<ItineraryBlock["type"], string>> = {
  activity: "Change activity in Services →",
  meal: "Change restaurant/menu in Services →",
  travel: "Change vehicle in Services →",
  check_in: "Change hotel in Services →",
  check_out: "Change hotel in Services →",
};

export function EditBlockDrawer({
  block,
  onClose,
  onSave,
  onRemove,
}: {
  block: ItineraryBlock | null;
  onClose: () => void;
  onSave: (blockId: string, patch: { title?: string; startTime: string; endTime: string }) => void;
  onRemove: (blockId: string) => void;
}) {
  const isDesktop = useIsDesktop();
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (!block) return;
    setTitle(block.title);
    setStartTime(block.startTime);
    setEndTime(block.endTime);
  }, [block]);

  const open = Boolean(block);
  const editableTitle = block?.type === "custom";
  const serviceLink = block ? SERVICE_LINK[block.type]?.(block) : undefined;
  const serviceLinkLabel = block ? SERVICE_LINK_LABEL[block.type] : undefined;
  const isInstant = block?.type === "check_in" || block?.type === "check_out";

  function handleSave() {
    if (!block) return;
    onSave(block.id, { title: editableTitle ? title : undefined, startTime, endTime: isInstant ? startTime : endTime });
    onClose();
  }

  const panelMotion = isDesktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return (
    <AnimatePresence>
      {open && block && (
        <motion.div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000] flex items-stretch justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-navy/50" />
          <motion.div
            {...panelMotion}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn("relative z-10 flex w-full flex-col overflow-hidden bg-white shadow-xl", isDesktop ? "h-full max-w-md rounded-l-2xl" : "mt-auto max-h-[85vh] rounded-t-2xl")}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="font-heading text-xl font-semibold text-navy">Edit Block</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-text-grey transition-colors hover:bg-navy/5 hover:text-navy">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6">
              {editableTitle ? (
                <label className="flex flex-col gap-1 font-body text-sm text-navy">
                  Title
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-navy/15 px-3 py-2 font-body text-sm text-navy" />
                </label>
              ) : (
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Edit Schedule</p>
                  <p className="font-heading text-lg font-semibold text-navy">{block.title}</p>
                  {block.subtitle && <p className="font-body text-sm text-text-grey">{block.subtitle}</p>}
                </div>
              )}

              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1 font-body text-sm text-navy">
                  {isInstant ? "Time" : "Start"}
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-lg border border-navy/15 px-3 py-2 font-body text-sm text-navy" />
                </label>
                {!isInstant && (
                  <label className="flex flex-1 flex-col gap-1 font-body text-sm text-navy">
                    End
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-lg border border-navy/15 px-3 py-2 font-body text-sm text-navy" />
                  </label>
                )}
              </div>

              {serviceLink && (
                <Link href={serviceLink} className="inline-flex w-fit items-center gap-1 font-body text-sm font-medium text-orange underline underline-offset-2">
                  {serviceLinkLabel} <ArrowRight size={12} />
                </Link>
              )}

              <div className="mt-2 flex flex-col gap-2">
                <button type="button" onClick={handleSave} className="rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onRemove(block.id);
                    onClose();
                  }}
                  className="rounded-full border border-navy/15 px-6 py-3 font-body text-sm font-medium text-navy transition-colors hover:bg-navy/5"
                >
                  Remove from Itinerary
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
