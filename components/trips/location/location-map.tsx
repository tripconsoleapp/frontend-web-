"use client";

import dynamic from "next/dynamic";
import type { LocationMapInnerProps } from "./location-map-inner";

const LocationMapInner = dynamic(() => import("./location-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#e8e6df]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy/20 border-t-orange" />
      <p className="font-body text-sm text-text-grey">Loading map...</p>
    </div>
  ),
});

export function LocationMap(props: LocationMapInnerProps) {
  return <LocationMapInner {...props} />;
}
