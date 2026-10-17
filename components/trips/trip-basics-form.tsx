"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  GraduationCap,
  Phone,
  School,
  ShieldAlert,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter-input";
import { CreateStepper } from "@/components/trips/create-stepper";
import { TripTypeCard } from "@/components/trips/trip-type-card";
import { TripSummaryPanel } from "@/components/trips/trip-summary-panel";
import { Template } from "@/lib/mock-templates";
import { getBasicsSummary, getReviewReturnHref, getTripMode, saveBasicsSummary, saveTripMode, getServicesDraft, saveServicesDraft, getBackendTripId, saveBackendTripId, resetTripDraft } from "@/lib/listing-draft";
import { instantiateFromTemplate } from "@/lib/template-instantiate";
import { ksrtcEligibilityReason } from "@/lib/transport-eligibility";
import { KsrtcEligibilityNote } from "@/components/trips/transport/ksrtc-eligibility-note";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { createTrip } from "@/lib/trip-api";
import { FormError } from "@/components/ui/form-error";

type TripType = "school" | "college" | "group" | "individual";

const TRIP_TYPES: {
  id: TripType;
  title: string;
  description: string;
  icon: ReactNode;
  tint: string;
}[] = [
  {
    id: "school",
    title: "School",
    description: "K-12 excursions and educational trips",
    icon: <School size={20} />,
    tint: "bg-mint/30 text-navy",
  },
  {
    id: "college",
    title: "College",
    description: "University trips and student groups",
    icon: <GraduationCap size={20} />,
    tint: "bg-orange/10 text-orange",
  },
  {
    id: "group",
    title: "Group",
    description: "Family, corporate, or pilgrimage groups",
    icon: <Users size={20} />,
    tint: "bg-navy/10 text-navy",
  },
  {
    id: "individual",
    title: "Individual",
    description: "Just you, or a small personal trip",
    icon: <User size={20} />,
    tint: "bg-mint/15 text-navy",
  },
];

const TRIP_TYPE_LABELS: Record<TripType, string> = {
  school: "School",
  college: "College",
  group: "Group",
  individual: "Individual",
};

function mapTemplateToTripType(template?: Template): TripType {
  const primary = template?.groupTypes[0];
  if (primary === "school") return "school";
  if (primary === "college") return "college";
  if (primary === "individual") return "individual";
  return "group";
}

function formatDateRange(start: string, end: string) {
  if (!start && !end) return "";
  if (start && !end) return new Date(start).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  if (start && end) {
    const s = new Date(start).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const e = new Date(end).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    return `${s} - ${e}`;
  }
  return "";
}

function formatDurationLabel(start: string, end: string) {
  if (!start || !end) return "";
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  if (days <= 0) return "";
  const nights = days - 1;
  return `${days} day${days === 1 ? "" : "s"} · ${nights} night${nights === 1 ? "" : "s"}`;
}

const fieldMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22 },
};

export function TripBasicsForm({
  template,
  participants,
  initialMode,
  initialEntry,
  resetDraft,
}: {
  template?: Template;
  participants?: string;
  initialMode?: "pilgrimage";
  initialEntry?: "scheduled";
  /** True only when this mount came from the dashboard/`/trips/new`
   *  "Start from Scratch" link with `?reset=1` — see trip-basics-form.tsx's
   *  mount effect and lib/listing-draft.ts's resetTripDraft(). Never set on
   *  a resume (back-navigation, refresh of an in-progress draft, template,
   *  or scheduled-trip path), so those keep loading the existing draft
   *  exactly as before. */
  resetDraft?: boolean;
}) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { authedFetch } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pilgrimage is a mode of the same trip model, not a separate flow —
  // resolved once (URL param for a fresh "scratch"/"scheduled" start, the
  // template's own group type, or a mode already saved from an earlier
  // visit to this page in the same draft) and then persisted so every
  // downstream step can read it without needing its own query param.
  const [tripMode, setTripMode] = useState<"standard" | "pilgrimage">("standard");
  // "Use a Template" never shows this form for a fresh instantiation — the
  // organizer already saw everything the template provides on the Template
  // Preview page, so this would only ask them to redo it. Set once a fresh
  // instantiation redirects away; a revisit via "Edit Trip Details" (the
  // template was already instantiated earlier) leaves this false and the
  // form renders normally, hydrated from the existing draft.
  const [redirectingToReview, setRedirectingToReview] = useState(false);
  useEffect(() => {
    if (template) {
      // Instantiates a fresh, independent listing from this template (new
      // trip record, services reset to the template's real included
      // services, route seeded, itinerary cleared) — a no-op if this
      // listing was already instantiated from this same template on an
      // earlier visit, so revisiting Basics never wipes out customization
      // made since.
      const freshlyInstantiated = instantiateFromTemplate(template, initialEntry);
      if (freshlyInstantiated) {
        setRedirectingToReview(true);
        router.replace(`/trips/create/template-review?template=${template.id}`);
        return;
      }
    } else {
      // Explicit "Start from Scratch" entry only — wipes the previous
      // trip's backendTripId, basics, destinations, services, and
      // itinerary before anything below reads or re-saves them, so this
      // mount never inherits a prior trip's data. The previous trip's own
      // record in the demo backend (lib/demo-backend.ts) is untouched —
      // only this single shared local draft slot is cleared. Strip the
      // query param immediately afterward so a later refresh of this same
      // URL can't re-trigger the wipe once the organizer has started
      // filling in the new trip's basics.
      if (resetDraft) {
        resetTripDraft();
        router.replace("/trips/create/basics");
      }
      const existing = getTripMode();
      const resolvedMode: "standard" | "pilgrimage" =
        existing.mode === "pilgrimage" || initialMode === "pilgrimage" ? "pilgrimage" : "standard";
      const resolvedEntry = existing.entryMethod ?? (
        initialEntry === "scheduled" ? "scheduled" : resolvedMode === "pilgrimage" ? "scratch" : null
      );
      saveTripMode({
        mode: resolvedMode,
        entryMethod: resolvedEntry,
        sourceTemplateId: existing.sourceTemplateId ?? null,
        sourceTemplateVersion: existing.sourceTemplateVersion ?? null,
      });

      // A pilgrimage trip never offers Activities — guard against a stale
      // `enabled: true` left over from an earlier standard-mode draft in
      // the same browser tab (the services slice isn't scoped per trip).
      if (resolvedMode === "pilgrimage") {
        const services = getServicesDraft();
        if (services.activities.enabled) {
          saveServicesDraft({
            ...services,
            activities: { enabled: false, configured: false, destinations: [] },
          });
        }
      }
    }
    setTripMode(getTripMode().mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [tripName, setTripName] = useState(template?.name ?? "");
  const [tripType, setTripType] = useState<TripType>(
    mapTemplateToTripType(template)
  );

  const initialParticipants = Number(participants) || template?.suggestedParticipants || 0;
  const [institutionName, setInstitutionName] = useState("");
  const [students, setStudents] = useState(
    tripType === "school" || tripType === "college" ? initialParticipants || 25 : 25
  );
  const [staff, setStaff] = useState(3);

  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState(
    tripType === "group" ? initialParticipants || 4 : 4
  );

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [budget, setBudget] = useState("");

  // The persisted listingDraft is the one source of truth for these
  // fields — a fresh instantiation (no existing basics yet) keeps the
  // template/URL-derived defaults above, but a revisit (refresh, or
  // navigating back from a later step) must show what was actually saved,
  // not silently fall back to those defaults again. This never re-runs
  // `instantiateFromTemplate` and never introduces a second store for
  // participant count — it only re-displays what's already in the draft.
  //
  // `basicsHydrated` gates the sync-to-draft effect below: without it, that
  // effect fires in the same initial mount flush as this one, before these
  // setState calls have committed, and would write the pre-hydration
  // defaults (e.g. the template's original count) straight back over the
  // value just read here.
  const [basicsHydrated, setBasicsHydrated] = useState(false);
  useEffect(() => {
    const existing = getBasicsSummary();
    if (!existing) {
      setBasicsHydrated(true);
      return;
    }
    if (existing.tripName && existing.tripName !== "Untitled Trip") setTripName(existing.tripName);
    if (existing.tripType) setTripType(existing.tripType);
    if (existing.startDate) setStartDate(existing.startDate);
    if (existing.endDate) setEndDate(existing.endDate);
    if (existing.tripType === "school" || existing.tripType === "college") {
      const studentsEntry = existing.participantBreakdown?.find((e) => e.label === "Students");
      const staffEntry = existing.participantBreakdown?.find((e) => e.label === "Staff");
      if (studentsEntry) setStudents(studentsEntry.count);
      if (staffEntry) setStaff(staffEntry.count);
    } else if (existing.tripType === "group") {
      setMembers(existing.participantCount);
    }
    setBasicsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateRangeLabel = useMemo(
    () => formatDateRange(startDate, endDate),
    [startDate, endDate]
  );

  const durationLabel = useMemo(
    () => formatDurationLabel(startDate, endDate),
    [startDate, endDate]
  );

  const travelerCount = useMemo(() => {
    if (tripType === "school" || tripType === "college") return students + staff;
    if (tripType === "group") return members;
    return 1;
  }, [tripType, students, staff, members]);

  // KSRTC eligibility is derived live from the same trip type + traveler
  // count that feeds the summary panel and downstream Services/Transport
  // steps — never a separately tracked number. An individual trip never
  // qualifies, regardless of count.
  const isIndividual = tripType === "individual";
  const ksrtcReason = useMemo(
    () => ksrtcEligibilityReason(travelerCount, isIndividual),
    [travelerCount, isIndividual]
  );

  // Downstream steps (Services → Transport) need real group size and dates
  // to validate vehicle capacity — write them into the shared listingDraft
  // as the organizer fills them in, rather than re-deriving or faking them.
  useEffect(() => {
    if (!basicsHydrated) return;
    const participantBreakdown =
      tripType === "school" || tripType === "college"
        ? [
            { label: "Students", count: students },
            { label: "Staff", count: staff },
          ]
        : undefined;
    saveBasicsSummary({
      tripName: tripName || "Untitled Trip",
      tripType,
      participantCount: travelerCount,
      participantBreakdown,
      startDate,
      endDate,
    });
  }, [basicsHydrated, tripName, tripType, travelerCount, startDate, endDate, students, staff]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // Only the plain Start-from-Scratch path creates a backend trip in this
    // phase — Templates, Join Scheduled Trip, and Pilgrimage keep their
    // existing (unconnected) behavior untouched. A draft that already has a
    // backend trip id (e.g. the organizer went back and re-submitted Basics)
    // is never re-created.
    const isPlainScratchTrip = !template && tripMode === "standard" && initialEntry !== "scheduled";
    if (isPlainScratchTrip && !getBackendTripId()) {
      setSubmitting(true);
      try {
        const trip = await createTrip(
          {
            tripName: tripName || "Untitled Trip",
            tripType,
            startDate,
            endDate,
            participantCount: travelerCount,
            staffCount: tripType === "school" || tripType === "college" ? staff : 0,
          },
          authedFetch
        );
        saveBackendTripId(trip.id);
      } catch (err) {
        setSubmitting(false);
        setSubmitError(
          err instanceof ApiError
            ? err.message
            : "Could not save your trip. Please try again."
        );
        // Do not navigate on failure — the form's local state (tripName,
        // dates, etc.) is untouched, so the organizer can fix the problem
        // and press Next again.
        return;
      }
      setSubmitting(false);
    }

    const params = new URLSearchParams();
    if (template) params.set("template", template.id);
    const nextPath =
      tripMode === "pilgrimage"
        ? "/trips/create/transport-preference"
        : "/trips/create/location";
    router.push(getReviewReturnHref(`${nextPath}?${params.toString()}`, template?.id));
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
  };
  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
      };

  if (redirectingToReview) {
    return <div className="h-64" />;
  }

  return (
    <div className="-mx-10 -my-10 min-h-[calc(100vh-2px)] bg-[#FAF8F4] px-10 py-10 xl:-mx-14 xl:-my-12 xl:px-14 xl:py-12">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-8">
        <motion.div variants={item}>
          <CreateStepper activeIndex={0} />
        </motion.div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="flex flex-col gap-10 lg:col-span-3">
            <motion.div variants={item}>
              <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">
                Build your trip
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-navy">
                Let&apos;s start with the essentials.
              </h1>
              <p className="mt-2 max-w-lg font-body text-base text-text-grey">
                Give your journey a name, choose the type of trip, and tell us
                a little about your group.
              </p>
            </motion.div>

            <motion.div variants={item} className="flex flex-col gap-3">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
                01 &middot; Name your journey
              </span>
              <Input
                label="Trip Name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g. Western Ghats Expedition"
                className="py-4 font-heading text-lg font-semibold text-navy"
                required
              />
            </motion.div>

            <motion.div variants={item} className="flex flex-col gap-3 border-t border-navy/10 pt-8">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
                02 &middot; Trip type
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {TRIP_TYPES.map((type) => (
                  <TripTypeCard
                    key={type.id}
                    icon={type.icon}
                    title={type.title}
                    description={type.description}
                    tint={type.tint}
                    selected={tripType === type.id}
                    onSelect={() => setTripType(type.id)}
                  />
                ))}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {(tripType === "school" || tripType === "college") && (
                <motion.div
                  key="school-college"
                  {...fieldMotion}
                  className="flex flex-col gap-4 border-t border-navy/10 pt-8"
                >
                  <span className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
                    03 &middot; Group details
                  </span>
                  <Input
                    label="Institution Name"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. St. Xavier's Higher Secondary School"
                    leftElement={<Building2 size={18} />}
                    required
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <CounterInput
                      label="Students"
                      value={students}
                      onChange={setStudents}
                      min={1}
                    />
                    <CounterInput
                      label="Staff"
                      value={staff}
                      onChange={setStaff}
                      min={0}
                    />
                  </div>
                  <p className="font-body text-xs text-text-grey">
                    Costs are calculated per student and finalized once
                    services are selected in a later step.
                  </p>
                  <KsrtcEligibilityNote reason={ksrtcReason} />
                </motion.div>
              )}

              {tripType === "individual" && (
                <motion.div
                  key="individual"
                  {...fieldMotion}
                  className="flex flex-col gap-4 border-t border-navy/10 pt-8"
                >
                  <span className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
                    03 &middot; Transport
                  </span>
                  <KsrtcEligibilityNote reason={ksrtcReason} />
                </motion.div>
              )}

              {tripType === "group" && (
                <motion.div
                  key="group"
                  {...fieldMotion}
                  className="flex flex-col gap-4 border-t border-navy/10 pt-8"
                >
                  <span className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
                    03 &middot; Group details
                  </span>
                  <Input
                    label="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Menon Family Reunion"
                    leftElement={<Users size={18} />}
                    required
                  />
                  <CounterInput
                    label="Members"
                    value={members}
                    onChange={setMembers}
                    min={1}
                  />
                  <p className="font-body text-xs text-text-grey">
                    Costs are calculated per member and finalized once services
                    are selected in a later step.
                  </p>
                  <KsrtcEligibilityNote reason={ksrtcReason} />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={item} className="flex flex-col gap-3 border-t border-navy/10 pt-8">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-orange">
                04 &middot; Travel dates
              </span>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <AnimatePresence>
                {durationLabel && (
                  <motion.p
                    {...fieldMotion}
                    className="font-body text-sm font-medium text-navy"
                  >
                    {durationLabel}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={item} className="flex flex-col gap-3 border-t border-navy/10 pt-8">
              <div>
                <span className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                  05 &middot; Emergency contact
                </span>
                <p className="mt-0.5 font-body text-xs text-text-grey">
                  For use during the journey.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Anita Menon"
                  leftElement={<ShieldAlert size={18} />}
                  required
                />
                <Input
                  label="Contact Phone"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="98765 43210"
                  leftElement={<Phone size={18} />}
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={item} className="flex flex-col gap-3 border-t border-navy/10 pt-8">
              <span className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                06 &middot; Estimated trip budget
              </span>
              <Input
                label="Budget (Optional)"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 150000"
                leftElement={<Wallet size={18} />}
                hint="A rough budget helps us suggest suitable services later."
              />
            </motion.div>

            <motion.div variants={item} className="flex flex-col gap-3 border-t border-navy/10 pt-8">
              <FormError message={submitError} />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-body text-sm text-text-grey">
                  Your trip basics are ready — next, map out your route.
                </p>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={buttonVariants({
                    variant: "accent",
                    size: "lg",
                    className: "w-fit shrink-0 disabled:cursor-not-allowed disabled:opacity-40",
                  })}
                >
                  {submitting ? "Saving..." : "Next: Destinations →"}
                </motion.button>
              </div>
            </motion.div>
          </div>

          <motion.div variants={item} className="lg:col-span-2">
            <TripSummaryPanel
              tripName={tripName}
              tripTypeLabel={TRIP_TYPE_LABELS[tripType]}
              travelerCount={travelerCount}
              dateRangeLabel={dateRangeLabel}
              durationLabel={durationLabel}
            />
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
