"use client";

import dynamic from "next/dynamic";
import { KeralaLocation } from "@/lib/kerala-locations";

const LeafletRouteMap = dynamic(() => import("./leaflet-route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[20px] border border-navy/10 bg-[#e8e6df] shadow-lg shadow-navy/10">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy/20 border-t-orange" />
      <p className="font-body text-sm text-text-grey">Loading map...</p>
    </div>
  ),
});

interface RouteMapProps {
  stops: KeralaLocation[];
  compact?: boolean;
  selectedId?: string | null;
  onSelectStop?: (id: string) => void;
  showFitControl?: boolean;
}

export function RouteMap(props: RouteMapProps) {
  return <LeafletRouteMap {...props} />;
}
