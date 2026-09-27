/**
 * KSRTC eligibility — one configurable business rule, read from one
 * place. TripConsole may internally arrange a KSRTC (Kerala State Road
 * Transport Corporation) vehicle for a trip, but only once the group is
 * large enough to justify it. The organizer never sees this as a
 * "hiring" decision — KSRTC is simply offered or not offered as a
 * transport source, the same way Private Operators is.
 *
 * This threshold has not been finalized by the business yet. When it
 * is, change ONLY this constant — no other file should ever hardcode a
 * passenger-count number for this rule.
 */
export const KSRTC_HIRE_MIN_PASSENGERS = 20;

/** The single source of truth for whether KSRTC can be offered.
 *  Eligibility depends on BOTH the trip's group classification and its
 *  passenger count — an individual trip never qualifies regardless of
 *  count, and a group only qualifies once it meets the threshold. Every
 *  screen that needs to know (Trip Basics, Transport Preference,
 *  Transport source selection, the KSRTC results route, the Services
 *  summary) calls this instead of comparing against the threshold
 *  itself. */
export function isKsrtcEligible(passengerCount: number, isIndividual: boolean): boolean {
  if (isIndividual) return false;
  return passengerCount >= KSRTC_HIRE_MIN_PASSENGERS;
}

export type KsrtcEligibilityReason = "individual" | "below_threshold" | "eligible";

/** The specific reason behind an eligibility result — lets messaging
 *  distinguish "you're travelling solo" from "your group isn't large
 *  enough yet" rather than collapsing both into one generic message. */
export function ksrtcEligibilityReason(passengerCount: number, isIndividual: boolean): KsrtcEligibilityReason {
  if (isIndividual) return "individual";
  if (passengerCount < KSRTC_HIRE_MIN_PASSENGERS) return "below_threshold";
  return "eligible";
}
