"use client";

import dynamic from "next/dynamic";
import { KeralaLocation } from "@/lib/kerala-locations";

const LeafletRouteMap = dynamic(() => import("./leaflet-route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-navy/10 bg-mint/10 shadow-lg shadow-navy/10">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy/20 border-t-orange" />
    </div>
  ),
});

interface RouteMapProps {
  stops: KeralaLocation[];
  compact?: boolean;
  onQuickAdd?: (location: KeralaLocation) => void;
  excludeIds?: string[];
}

export function RouteMap(props: RouteMapProps) {
  return <LeafletRouteMap {...props} />;
}
