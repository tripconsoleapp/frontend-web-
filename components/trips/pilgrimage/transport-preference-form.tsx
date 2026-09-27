"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Check, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";
import { getServicesDraft, saveServicesDraft } from "@/lib/listing-draft";
import { useTripContext } from "@/lib/use-trip-context";
import { useTripMode } from "@/lib/use-trip-mode";
import { isKsrtcEligible, ksrtcEligibilityReason } from "@/lib/transport-eligibility";
import { KsrtcEligibilityNote } from "@/components/trips/transport/ksrtc-eligibility-note";
import { TransportContextHeader } from "@/components/trips/transport/transport-context-header";

type Source = "private" | "ksrtc";

/** This step only records a preference — it never books a vehicle. The
 *  actual transport configuration still happens later at
 *  Services → Transport, using the existing Transport workflow, which
 *  reads this same `lastSource` value so the organizer isn't asked
 *  twice. */
export function TransportPreferenceForm({ template }: { template?: string }) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { passengerCount, isIndividual, ready } = useTripContext();
  const { mode, ready: modeReady } = useTripMode();
  const [selected, setSelected] = useState<Source | null>(null);
  const [hadKsrtcPreference, setHadKsrtcPreference] = useState(false);

  // This step only exists for pilgrimage trips — a standard trip that
  // somehow lands here (stale link, back/forward) goes straight to the
  // regular Starting Location step instead.
  useEffect(() => {
    if (modeReady && mode !== "pilgrimage") {
      router.replace(`/trips/create/location${template ? `?template=${template}` : ""}`);
    }
  }, [modeReady, mode, router, template]);

  useEffect(() => {
    if (!ready) return;
    const draft = getServicesDraft();
    if (draft.vehicle.lastSource === "ksrtc") {
      if (isKsrtcEligible(passengerCount, isIndividual)) {
        setHadKsrtcPreference(true);
        setSelected("ksrtc");
      } else {
        // Trip Basics changed since this preference was recorded (fewer
        // passengers, or switched to Individual) — correct the stale
        // preference back to Private rather than leaving it in the draft.
        saveServicesDraft({ ...draft, vehicle: { ...draft.vehicle, lastSource: "private" } });
        setHadKsrtcPreference(true);
      }
    } else if (draft.vehicle.lastSource === "private") {
      setSelected("private");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const eligible = ready && isKsrtcEligible(passengerCount, isIndividual);
  const eligibilityReason = ksrtcEligibilityReason(passengerCount, isIndividual);
  const query = template ? `?template=${template}` : "";
  const backHref = `/trips/create/basics${query}`;

  function handleContinue() {
    const draft = getServicesDraft();
    const preference: Source = selected ?? "private";
    saveServicesDraft({
      ...draft,
      vehicle: { ...draft.vehicle, lastSource: preference },
    });
    router.push(`/trips/create/location${query}`);
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 pb-28">
      <TransportContextHeader
        backHref={backHref}
        backLabel="Back to Basics"
        eyebrow="Pilgrimage Setup"
      />

      <div>
        <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
          How would you like to travel?
        </h1>
        <p className="mt-2 max-w-md font-body text-base text-text-grey">
          This sets your preference only — you&apos;ll choose the actual
          vehicle later, from Services.
        </p>
      </div>

      <div className="rounded-xl border border-navy/10 bg-navy/[0.02] px-4 py-3">
        <KsrtcEligibilityNote reason={eligibilityReason} />
      </div>

      {eligible && hadKsrtcPreference && selected !== "ksrtc" && (
        <p className="-mt-4 font-body text-xs text-text-grey">
          Your group size no longer qualifies for KSRTC — choose again below.
        </p>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col divide-y divide-navy/10 overflow-hidden rounded-2xl border border-navy/10"
      >
        <motion.button
          key="private"
          variants={item}
          type="button"
          onClick={() => setSelected("private")}
          aria-pressed={selected === "private"}
          className={cn(
            "flex items-center gap-4 px-6 py-5 text-left transition-colors duration-200",
            selected === "private" ? "bg-mint/10" : "bg-white hover:bg-navy/[0.02]"
          )}
        >
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              selected === "private" ? "bg-navy text-white" : "bg-navy/5 text-navy"
            )}
          >
            <Truck size={19} />
          </span>
          <div className="flex-1">
            <h3 className="font-heading text-base font-semibold text-navy">
              Private Operators
            </h3>
            <p className="mt-0.5 font-body text-sm text-text-grey">
              Flexible operators and vehicles from verified providers.
            </p>
          </div>
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
              selected === "private" ? "border-navy bg-navy text-white" : "border-navy/20"
            )}
          >
            {selected === "private" && <Check size={13} strokeWidth={3} />}
          </span>
        </motion.button>

        {eligible && (
          <motion.button
            key="ksrtc"
            variants={item}
            type="button"
            onClick={() => setSelected("ksrtc")}
            aria-pressed={selected === "ksrtc"}
            className={cn(
              "flex items-center gap-4 px-6 py-5 text-left transition-colors duration-200",
              selected === "ksrtc" ? "bg-mint/10" : "bg-white hover:bg-navy/[0.02]"
            )}
          >
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                selected === "ksrtc" ? "bg-navy text-white" : "bg-navy/5 text-navy"
              )}
            >
              <ShieldCheck size={19} />
            </span>
            <div className="flex-1">
              <h3 className="font-heading text-base font-semibold text-navy">KSRTC</h3>
              <p className="mt-0.5 font-body text-sm text-text-grey">
                Government-operated transport options.
              </p>
            </div>
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                selected === "ksrtc" ? "border-navy bg-navy text-white" : "border-navy/20"
              )}
            >
              {selected === "ksrtc" && <Check size={13} strokeWidth={3} />}
            </span>
          </motion.button>
        )}
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-navy/10 bg-white px-10 py-4 lg:left-60">
        <span className="font-body text-sm text-text-grey">
          Private transport is always available.
        </span>
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className={buttonVariants({ variant: "accent", size: "lg" })}
        >
          Continue &rarr;
        </motion.button>
      </div>
    </div>
  );
}
