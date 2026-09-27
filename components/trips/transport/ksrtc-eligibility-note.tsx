import { KsrtcEligibilityReason } from "@/lib/transport-eligibility";

const MESSAGES: Record<KsrtcEligibilityReason, string> = {
  individual:
    "Private Operator available. KSRTC unavailable — it's only offered for eligible group trips.",
  below_threshold:
    "Private Operator available. KSRTC becomes available once the group reaches 20 passengers.",
  eligible: "Both Private Operator and KSRTC are available for this group.",
};

/** Shown in Trip Basics (and reused wherever else group size and KSRTC
 *  eligibility intersect) — informational only, never blocks the
 *  organizer from continuing. Deliberately quiet: a line of context, not
 *  an alert box — the message varies by *why* KSRTC isn't available
 *  (travelling solo vs. group not yet large enough), not just whether it
 *  is. */
export function KsrtcEligibilityNote({ reason }: { reason: KsrtcEligibilityReason }) {
  return (
    <p className="font-body text-xs leading-relaxed text-text-grey">
      <span
        className={
          reason === "eligible" ? "font-medium text-navy" : "font-medium text-navy/70"
        }
      >
        Transport &middot;{" "}
      </span>
      {MESSAGES[reason]}
    </p>
  );
}
