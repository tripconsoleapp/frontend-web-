"use client";

/**
 * "Use a Template" instantiation — turns a Template (a maintained, reusable
 * blueprint) into a fresh, independently-editable listing draft.
 *
 * The template object itself is never written to; every value taken from
 * it is copied into a brand-new draft (`TripRecord`, `ServicesDraft`,
 * `ItineraryDraft`) rather than referenced, so later edits to the new
 * listing can never leak back into the template or into whatever listing
 * happened to be in this session's storage before.
 *
 * What this does NOT do (deliberately): copy any booking/transaction data
 * — a template has none to begin with (no reservation IDs, no payment
 * state, no confirmed hotel/vehicle) — everything it hands the new
 * listing is a default/preference, not a live booking.
 */

import { Template } from "./mock-templates";
import { resolveTemplateRoute } from "./template-route";
import {
  DEFAULT_ITINERARY_DRAFT,
  DEFAULT_SERVICES_DRAFT,
  ServicesDraft,
  TripEntryMethod,
  defaultTripRecord,
  generateTripId,
  getTripMode,
  saveDestinationsSummary,
  saveItineraryDraft,
  saveServicesDraft,
  saveTripMode,
  saveTripRecord,
} from "./listing-draft";

function templateIncludes(template: Template, label: string) {
  return template.includedServices.some((s) => s.toLowerCase() === label.toLowerCase());
}

/** Idempotent per template: revisiting Basics after the organizer has
 *  already started customizing (added destinations, configured services)
 *  must never wipe that work just because `template` is still in the URL.
 *  Only a genuinely new "Use this template" — a different template id
 *  than the one already recorded — re-instantiates. Returns whether a
 *  fresh instantiation actually happened, so the caller can decide
 *  whether to jump straight to Template Review (fresh) or render
 *  normally for editing (revisit). */
export function instantiateFromTemplate(template: Template, entry?: "scheduled"): boolean {
  const existing = getTripMode();
  if (existing.sourceTemplateId === template.id) return false;

  // A fresh listing gets a fresh id — never silently reuse whatever trip
  // record happened to be sitting in this session's storage.
  saveTripRecord(defaultTripRecord(generateTripId()));

  // Services start from the template's real, already-existing
  // `includedServices` signal (never a fabricated one) — Activities is
  // never enabled from a template. Transport gets only a *preference*
  // (`lastSource`), never a confirmed vehicle — the organizer still goes
  // through the real Transport workflow to actually book one, and that
  // preference is re-validated against this listing's own passenger
  // count by the existing eligibility rule, not trusted blindly.
  const services: ServicesDraft = {
    ...DEFAULT_SERVICES_DRAFT,
    vehicle: {
      ...DEFAULT_SERVICES_DRAFT.vehicle,
      lastSource: template.defaultTransportPreference,
    },
    hotel: { ...DEFAULT_SERVICES_DRAFT.hotel, enabled: templateIncludes(template, "stay") },
    restaurant: { ...DEFAULT_SERVICES_DRAFT.restaurant, enabled: templateIncludes(template, "meals") },
  };
  saveServicesDraft(services);

  // The route is part of the blueprint too — seeded immediately so
  // Template Review can show "Kochi → Erumeli → Sabarimala" without ever
  // forcing a visit to the Destinations page. The organizer can still
  // reorder, remove, or add a Custom Stop through the exact same
  // Destinations workflow via "Edit Route" — this only sets the starting
  // values it opens with.
  const route = resolveTemplateRoute(template);
  saveDestinationsSummary({
    routeLabel: route.stops.length
      ? `${route.startLocationName} → ${route.stops[route.stops.length - 1].name}`
      : route.startLocationName,
    stops: route.stops.map((s) => ({ id: s.id, name: s.name, nights: s.nights })),
    startLocationId: route.startLocationId,
    startLocationName: route.startLocationName,
  });

  // The itinerary is always generated fresh from the listing's own real
  // dates/services (see lib/itinerary.ts) — a template's itinerary is
  // display-only content for the template preview, never a seed for this,
  // so there's nothing stale to carry over; just start clean.
  saveItineraryDraft(DEFAULT_ITINERARY_DRAFT);

  const entryMethod: TripEntryMethod = entry === "scheduled" ? "scheduled" : "template";
  saveTripMode({
    mode: template.groupTypes.includes("pilgrimage") ? "pilgrimage" : "standard",
    entryMethod,
    sourceTemplateId: template.id,
    sourceTemplateVersion: template.version ?? 1,
    // A fresh template-derived listing starts in the consolidated review
    // experience — every workflow's terminal action returns here until
    // the organizer explicitly continues to Final Review.
    reviewReturnActive: true,
  });
  return true;
}
