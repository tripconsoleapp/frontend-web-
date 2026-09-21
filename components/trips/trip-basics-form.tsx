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
import { saveBasicsSummary } from "@/lib/listing-draft";

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
}: {
  template?: Template;
  participants?: string;
}) {
  const router = useRouter();
  const shouldReduce = useReducedMotion();

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

  // Downstream steps (Services → Transport) need real group size and dates
  // to validate vehicle capacity — write them into the shared listingDraft
  // as the organizer fills them in, rather than re-deriving or faking them.
  useEffect(() => {
    const participantBreakdown =
      tripType === "school" || tripType === "college"
        ? [
            { label: "Students", count: students },
            { label: "Staff", count: staff },
          ]
        : undefined;
    saveBasicsSummary({
      tripName: tripName || "Untitled Trip",
      participantCount: travelerCount,
      participantBreakdown,
      startDate,
      endDate,
    });
  }, [tripName, travelerCount, startDate, endDate, tripType, students, staff]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (template) params.set("template", template.id);
    router.push(`/trips/create/location?${params.toString()}`);
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

            <motion.div
              variants={item}
              className="flex flex-col gap-4 border-t border-navy/10 pt-8 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="font-body text-sm text-text-grey">
                Your trip basics are ready — next, map out your route.
              </p>
              <motion.button
                type="submit"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={buttonVariants({ variant: "accent", size: "lg", className: "w-fit shrink-0" })}
              >
                Next: Destinations &rarr;
              </motion.button>
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
