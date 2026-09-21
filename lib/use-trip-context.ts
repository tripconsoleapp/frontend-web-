"use client";

import { useEffect, useState } from "react";
import {
  DestinationStopSummary,
  ParticipantBreakdownEntry,
  getBasicsSummary,
  getDestinationsSummary,
} from "./listing-draft";
import { formatDateRange } from "./mock-trips";

export interface TripContext {
  tripName: string;
  passengerCount: number;
  participantBreakdown: ParticipantBreakdownEntry[];
  startDate: string;
  endDate: string;
  dateRangeLabel: string;
  routeLabel: string;
  /** Overnight destinations only (nights > 0), in route order — the source
   *  of truth for which stops the Hotel flow needs to walk through. */
  stops: DestinationStopSummary[];
  startLocationId: string;
  startLocationName: string;
  /** False until the client-only sessionStorage read has run. Screens that
   *  depend on passengerCount for capacity math should treat a not-ready
   *  context as "still loading" rather than "zero passengers". */
  ready: boolean;
}

const EMPTY: TripContext = {
  tripName: "",
  passengerCount: 0,
  participantBreakdown: [],
  startDate: "",
  endDate: "",
  dateRangeLabel: "",
  routeLabel: "",
  stops: [],
  startLocationId: "",
  startLocationName: "",
  ready: false,
};

/** Real trip context (group size, dates, route) written by Basics and
 *  Destinations into the shared listingDraft — never fabricated here. */
export function useTripContext(): TripContext {
  const [context, setContext] = useState<TripContext>(EMPTY);

  useEffect(() => {
    const basics = getBasicsSummary();
    const destinations = getDestinationsSummary();
    setContext({
      tripName: basics?.tripName ?? "",
      passengerCount: basics?.participantCount ?? 0,
      participantBreakdown: basics?.participantBreakdown ?? [],
      startDate: basics?.startDate ?? "",
      endDate: basics?.endDate ?? "",
      dateRangeLabel:
        basics?.startDate && basics?.endDate
          ? formatDateRange(basics.startDate, basics.endDate)
          : "",
      routeLabel: destinations?.routeLabel ?? "",
      stops: destinations?.stops ?? [],
      startLocationId: destinations?.startLocationId ?? "",
      startLocationName: destinations?.startLocationName ?? "",
      ready: true,
    });
  }, []);

  return context;
}
