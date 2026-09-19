"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
}

interface StylizedMapProps {
  locations: MapLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Illustrated stand-in for a real map integration (no maps API is
 * configured in this project). Positions are on a fixed 400x600
 * coordinate space; the container must keep that 2:3 aspect ratio so
 * the SVG background and the HTML marker overlay stay in sync.
 */
export function StylizedMap({
  locations,
  selectedId,
  onSelect,
}: StylizedMapProps) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-navy/10 bg-gradient-to-b from-mint/15 via-white to-mint/10 shadow-inner">
      <svg
        viewBox="0 0 400 600"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 40}
            y1="0"
            x2={i * 40}
            y2="600"
            stroke="var(--color-navy)"
            strokeOpacity="0.05"
          />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 40}
            x2="400"
            y2={i * 40}
            stroke="var(--color-navy)"
            strokeOpacity="0.05"
          />
        ))}
        <polyline
          points={locations.map((loc) => `${loc.x},${loc.y}`).join(" ")}
          fill="none"
          stroke="var(--color-navy)"
          strokeOpacity="0.18"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
      </svg>

      {locations.map((loc) => (
        <button
          key={loc.id}
          type="button"
          onClick={() => onSelect(loc.id)}
          style={{
            left: `${(loc.x / 400) * 100}%`,
            top: `${(loc.y / 600) * 100}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          aria-pressed={selectedId === loc.id}
          aria-label={`Select ${loc.name} as starting location`}
        >
          <motion.span
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1"
          >
            <span
              className={cn(
                "h-4 w-4 rounded-full border-2 border-white shadow-md transition-colors",
                selectedId === loc.id ? "bg-orange" : "bg-navy"
              )}
            />
            <span
              className={cn(
                "whitespace-nowrap rounded-full px-2 py-0.5 font-body text-[11px] font-semibold shadow-sm transition-colors",
                selectedId === loc.id
                  ? "bg-orange text-white"
                  : "bg-white text-navy"
              )}
            >
              {loc.name}
            </span>
          </motion.span>
        </button>
      ))}
    </div>
  );
}
