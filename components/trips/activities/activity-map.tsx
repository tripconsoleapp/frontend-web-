"use client";

import dynamic from "next/dynamic";
import { MapPoint } from "./activity-map-inner";

const ActivityMapInner = dynamic(() => import("./activity-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-navy/10 bg-mint/10">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy/20 border-t-orange" />
      <p className="font-body text-sm text-text-grey">Loading map...</p>
    </div>
  ),
});

export function ActivityMap(props: {
  activities: MapPoint[];
  hiddenGems?: MapPoint[];
  selectedId?: string | null;
  onSelectActivity?: (id: string) => void;
}) {
  return <ActivityMapInner {...props} />;
}
