"use client";

import { useEffect, useState } from "react";
import { getTripMode, TripEntryMethod, TripMode } from "./listing-draft";

export interface TripModeContext {
  mode: TripMode;
  entryMethod: TripEntryMethod | null;
  /** False until the client-only sessionStorage read has run — screens
   *  that branch on `mode` (e.g. hiding Activities, skipping a step)
   *  should wait for this rather than assuming "standard" is final. */
  ready: boolean;
}

/** Reads the trip's mode (standard vs. pilgrimage) from the shared
 *  listingDraft — set once by Trip Basics at creation time, then read
 *  by every downstream step. Never re-derived or passed through the URL
 *  beyond that first hop, so back/forward navigation and reloads keep
 *  working without extra query params. */
export function useTripMode(): TripModeContext {
  const [state, setState] = useState<TripModeContext>({
    mode: "standard",
    entryMethod: null,
    ready: false,
  });

  useEffect(() => {
    const stored = getTripMode();
    setState({ mode: stored.mode, entryMethod: stored.entryMethod, ready: true });
  }, []);

  return state;
}
