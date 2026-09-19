"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
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
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { CounterInput } from "@/components/ui/counter-input";
import { CreateStepper } from "@/components/trips/create-stepper";
import { TripTypeCard } from "@/components/trips/trip-type-card";
import { TripSummaryPanel } from "@/components/trips/trip-summary-panel";
import { Template } from "@/lib/mock-templates";

type TripType = "school" | "college" | "group" | "individual";

const TRIP_TYPES: {
  id: TripType;
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    id: "school",
    title: "School",
    description: "K-12 excursions and educational trips",
    icon: <School size={20} />,
  },
  {
    id: "college",
    title: "College",
    description: "University trips and student groups",
    icon: <GraduationCap size={20} />,
  },
  {
    id: "group",
    title: "Group",
    description: "Family, corporate, or pilgrimage groups",
    icon: <Users size={20} />,
  },
  {
    id: "individual",
    title: "Individual",
    description: "Just you, or a small personal trip",
    icon: <User size={20} />,
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

export function TripBasicsForm({
  template,
  participants,
}: {
  template?: Template;
  participants?: string;
}) {
  const router = useRouter();

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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (template) params.set("template", template.id);
    router.push(`/trips/create/location?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <CreateStepper activeIndex={0} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <div>
            <h1 className="font-heading text-2xl font-bold text-navy">
              Trip Basics
            </h1>
            <p className="mt-1 font-body text-sm text-text-grey">
              Start with the essentials — you can refine everything else in
              the steps ahead.
            </p>
          </div>

          <div className="flex flex-col gap-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
            <Input
              label="Trip Name"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="e.g. Western Ghats Expedition"
              required
            />

            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                Trip Type
              </label>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {TRIP_TYPES.map((type) => (
                  <TripTypeCard
                    key={type.id}
                    icon={type.icon}
                    title={type.title}
                    description={type.description}
                    selected={tripType === type.id}
                    onSelect={() => setTripType(type.id)}
                  />
                ))}
              </div>
            </div>

            {(tripType === "school" || tripType === "college") && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
                Emergency Contact
              </label>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            </div>

            <Input
              label="Budget (Optional)"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 150000"
              leftElement={<Wallet size={18} />}
              hint="A rough total budget helps us suggest suitable services later."
            />
          </div>

          <div className="flex justify-end">
            <motion.button
              type="submit"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={buttonVariants({ variant: "accent", size: "lg" })}
            >
              Next: Destinations &rarr;
            </motion.button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <TripSummaryPanel
            tripName={tripName}
            tripTypeLabel={TRIP_TYPE_LABELS[tripType]}
            dateRangeLabel={dateRangeLabel}
          />
        </div>
      </form>
    </div>
  );
}
