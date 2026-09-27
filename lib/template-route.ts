/**
 * A template's own route — real per-template destinations, resolved once
 * and reused by both the instantiation step (which seeds the new
 * listing's `destinationsSummary` immediately, so Template Review can show
 * "Route: Kochi → Erumeli → Sabarimala" without ever visiting the
 * Destinations page) and the Destinations workflow itself (whose own
 * prefill, when the organizer does open "Edit Route", must show the exact
 * same stops rather than a second, independently-computed list).
 */

import { DestinationStop } from "@/components/trips/itinerary-stop-card";
import { getKeralaLocation, KeralaLocation } from "./kerala-locations";
import { getPilgrimageDestination } from "./pilgrimage-destinations";
import { getTemplateById, Template } from "./mock-templates";

const FALLBACK_START: KeralaLocation = {
  id: "kochi",
  name: "Kochi",
  district: "Ernakulam, Kerala",
  x: 150,
  y: 220,
  lat: 9.9312,
  lng: 76.2673,
};

function resolveLocation(id: string) {
  return getPilgrimageDestination(id) ?? getKeralaLocation(id);
}

function toStop(loc: NonNullable<ReturnType<typeof resolveLocation>>): DestinationStop {
  return {
    id: loc.id,
    name: loc.name,
    district: loc.district,
    x: loc.x,
    y: loc.y,
    lat: loc.lat,
    lng: loc.lng,
    nights: 1,
    overnight: true,
  };
}

/** Generic fallback for templates that don't define their own route (the
 *  existing non-pilgrimage Western Ghats / Munnar templates). */
const GENERIC_STOPS: DestinationStop[] = [
  { ...getKeralaLocation("munnar")!, nights: 2, overnight: true },
  { ...getKeralaLocation("thekkady")!, nights: 2, overnight: true },
];

export interface ResolvedTemplateRoute {
  startLocationId: string;
  startLocationName: string;
  stops: DestinationStop[];
}

export function resolveTemplateRoute(template: Template): ResolvedTemplateRoute {
  const start = template.defaultStartLocationId
    ? (resolveLocation(template.defaultStartLocationId) ?? FALLBACK_START)
    : FALLBACK_START;

  const stops = template.defaultDestinationIds?.length
    ? template.defaultDestinationIds
        .map(resolveLocation)
        .filter((loc): loc is NonNullable<typeof loc> => Boolean(loc))
        .map(toStop)
    : GENERIC_STOPS;

  return { startLocationId: start.id, startLocationName: start.name, stops };
}

export function resolveTemplateRouteById(templateId?: string): ResolvedTemplateRoute | null {
  const template = templateId ? getTemplateById(templateId) : undefined;
  return template ? resolveTemplateRoute(template) : null;
}
