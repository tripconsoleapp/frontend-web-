"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Check, ImagePlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTripContext } from "@/lib/use-trip-context";
import { IdDocumentType, TravelerType, TripRecord, getTripRecord, saveTripRecord } from "@/lib/listing-draft";
import { deriveRegistrationStatus, generateTravelerId, idTypeLabel } from "@/lib/trip-operations";

const TRAVELER_TYPES: TravelerType[] = ["student", "staff", "traveler"];
const ID_TYPES: IdDocumentType[] = ["passport", "aadhaar", "school_id", "driving_license", "other"];

interface FormState {
  name: string;
  travelerType: TravelerType;
  idType: IdDocumentType;
  idNumber: string;
  phone: string;
  hasIdPhoto: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  travelerType: "traveler",
  idType: "passport",
  idNumber: "",
  phone: "",
  hasIdPhoto: false,
  emergencyContactName: "",
  emergencyContactPhone: "",
};

export function AddTraveler({ tripId }: { tripId: string }) {
  const router = useRouter();
  const trip = useTripContext();
  const [record, setRecord] = useState<TripRecord | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setRecord(getTripRecord());
  }, []);

  if (!record) {
    return <div className="h-64 animate-pulse rounded-2xl bg-navy/[0.04]" />;
  }

  if (record.id !== tripId) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This trip couldn&rsquo;t be found.</p>
        <Link href="/trips" className="font-body text-sm font-semibold text-orange underline underline-offset-2">Back to My Trips</Link>
      </div>
    );
  }

  const travelerCount = record.passengerManagement.travelers.length;
  const isValid = form.name.trim().length > 0 && form.idNumber.trim().length > 0 && form.phone.trim().length > 0;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save(andAddAnother: boolean) {
    if (!isValid || !record) return;
    const now = new Date().toISOString();
    const traveler = {
      id: generateTravelerId(),
      name: form.name.trim(),
      travelerType: form.travelerType,
      idType: form.idType,
      idNumber: form.idNumber.trim(),
      phone: form.phone.trim(),
      hasIdPhoto: form.hasIdPhoto,
      emergencyContactName: form.emergencyContactName.trim() || undefined,
      emergencyContactPhone: form.emergencyContactPhone.trim() || undefined,
      source: "manual" as const,
      registrationStatus: "submitted" as const,
      createdAt: now,
      updatedAt: now,
    };
    const travelers = [...record.passengerManagement.travelers, traveler];
    const next: TripRecord = {
      ...record,
      passengerManagement: {
        ...record.passengerManagement,
        travelers,
        registrationStatus: deriveRegistrationStatus(travelers, trip.passengerCount, Boolean(record.passengerManagement.registrationLinkToken)),
      },
    };
    saveTripRecord(next);
    setRecord(next);

    if (andAddAnother) {
      setForm(EMPTY_FORM);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1800);
    } else {
      router.push(`/trips/${tripId}/passengers`);
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Link href={`/trips/${tripId}/passengers`} className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
        <ArrowLeft size={14} /> Back to passengers
      </Link>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">
          Traveler {travelerCount + 1} of {trip.passengerCount || "?"}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Add Traveler</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Enter details for one traveler at a time.</p>
      </div>

      {justSaved && (
        <div className="flex items-center gap-2 rounded-xl bg-mint/30 px-4 py-2.5 font-body text-sm font-medium text-navy">
          <Check size={14} /> Saved. Add the next traveler.
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Full Name</label>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="As per ID document" className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy placeholder:text-text-grey/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>

        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Traveler Type</label>
          <div className="mt-1.5 flex gap-2">
            {TRAVELER_TYPES.map((type) => (
              <button key={type} type="button" onClick={() => set("travelerType", type)} className={cn("rounded-full border px-4 py-1.5 font-body text-sm font-medium capitalize transition-colors", form.travelerType === type ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30")}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">ID Type</label>
            <select value={form.idType} onChange={(e) => set("idType", e.target.value as IdDocumentType)} className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10">
              {ID_TYPES.map((t) => (
                <option key={t} value={t}>{idTypeLabel(t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">ID Number</label>
            <input value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)} className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
          </div>
        </div>

        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Phone Number</label>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210" className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy placeholder:text-text-grey/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>

        <button type="button" onClick={() => set("hasIdPhoto", !form.hasIdPhoto)} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors", form.hasIdPhoto ? "border-orange bg-orange/5" : "border-navy/10 hover:border-navy/25")}>
          <ImagePlus size={16} className={form.hasIdPhoto ? "text-orange" : "text-navy/50"} />
          <span className="font-body text-sm font-medium text-navy">ID photo captured</span>
          {form.hasIdPhoto && <Check size={14} className="ml-auto text-orange" />}
        </button>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Emergency Contact Name <span className="normal-case text-text-grey/60">(optional)</span></label>
            <input value={form.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Emergency Contact Phone <span className="normal-case text-text-grey/60">(optional)</span></label>
            <input value={form.emergencyContactPhone} onChange={(e) => set("emergencyContactPhone", e.target.value)} className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <motion.button type="button" whileHover={isValid ? { y: -1 } : undefined} whileTap={isValid ? { scale: 0.98 } : undefined} disabled={!isValid} onClick={() => save(false)} className="inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40">
          Save &amp; Done
        </motion.button>
        <button type="button" disabled={!isValid} onClick={() => save(true)} className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-6 py-3 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5 disabled:cursor-not-allowed disabled:opacity-40">
          Save &amp; Add Another
        </button>
      </div>
    </div>
  );
}
