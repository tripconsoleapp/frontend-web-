"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Sparkles } from "lucide-react";
import { getHiddenGemsForDestination } from "@/lib/mock-activity-catalog";
import { ActivityContextHeader } from "./activity-context-header";
import { ActivityMap } from "./activity-map";

export function HiddenGemsExplorer({ destinationId, destinationName, template }: { destinationId: string; destinationName: string; template?: string }) {
  const shouldReduce = useReducedMotion();
  const templateQuery = template ? `?template=${template}` : "";
  const gems = getHiddenGemsForDestination(destinationId);

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } } };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <ActivityContextHeader
        backHref={`/trips/create/services/activities/${destinationId}/discover${templateQuery}`}
        backLabel="Back to activities"
        eyebrow="Discovery"
      />

      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-mint" />
        <h1 className="font-heading text-2xl font-bold text-navy">Hidden Gems near {destinationName}</h1>
      </div>
      <p className="max-w-xl font-body text-base text-navy/70">
        Looking for places beyond the usual tourist stops? These are local viewpoints, quiet nature spots, and
        lesser-known places around your route — not bookable experiences, just worth knowing about.
      </p>

      {gems.length > 0 && (
        <div className="h-64 overflow-hidden rounded-2xl">
          <ActivityMap activities={[]} hiddenGems={gems.map((g) => ({ id: g.id, name: g.name, lat: g.lat, lng: g.lng }))} />
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {gems.map((g) => (
          <motion.div key={g.id} variants={item} className="flex flex-col gap-2">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl">
              <Image src={g.imageUrl} alt={g.name} fill sizes="(min-width: 640px) 45vw, 100vw" className="object-cover" />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-body text-[11px] font-semibold text-navy backdrop-blur-sm">
                {g.type}
              </span>
            </div>
            <h3 className="font-heading text-base font-semibold text-navy">{g.name}</h3>
            <p className="font-body text-xs text-text-grey">
              {g.distanceLabel} &middot; {g.durationLabel}
            </p>
            <p className="font-body text-sm text-navy/70">{g.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {gems.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-14 text-center">
          <Sparkles size={20} className="text-mint" />
          <p className="font-heading text-base font-semibold text-navy">No hidden gems catalogued here yet.</p>
        </div>
      )}
    </div>
  );
}
