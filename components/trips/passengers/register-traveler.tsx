"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, ImagePlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { IdDocumentType, TravelerType } from "@/lib/listing-draft";
import {
  RegistrationSnapshot,
  addSelfRegistration,
  generateRegistrationId,
  generateTravelerId,
  getRegistrationSnapshot,
  idTypeLabel,
} from "@/lib/trip-operations";

type Stage = "loading" | "not-found" | "form" | "done";

const TRAVELER_TYPES: TravelerType[] = ["student", "staff", "traveler"];
const ID_TYPES: IdDocumentType[] = ["passport", "aadhaar", "school_id", "driving_license", "other"];

export function RegisterTraveler({ token }: { token: string }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [snapshot, setSnapshot] = useState<RegistrationSnapshot | null>(null);
  const [regId, setRegId] = useState("");

  const [name, setName] = useState("");
  const [travelerType, setTravelerType] = useState<TravelerType>("traveler");
  const [idType, setIdType] = useState<IdDocumentType>("passport");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [hasIdPhoto, setHasIdPhoto] = useState(false);
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const found = getRegistrationSnapshot(token);
    if (!found) {
      setStage("not-found");
      return;
    }
    setSnapshot(found);
    setStage("form");
  }, [token]);

  const isValid = name.trim().length > 0 && idNumber.trim().length > 0 && phone.trim().length > 0 && consent;

  function handleSubmit() {
    if (!isValid) return;
    const now = new Date().toISOString();
    addSelfRegistration(token, {
      id: generateTravelerId(),
      name: name.trim(),
      travelerType,
      idType,
      idNumber: idNumber.trim(),
      phone: phone.trim(),
      hasIdPhoto,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      source: "link",
      registrationStatus: "submitted",
      createdAt: now,
      updatedAt: now,
    });
    setRegId(generateRegistrationId());
    setStage("done");
  }

  if (stage === "loading") {
    return <CenteredShell><div className="h-40 w-full max-w-sm animate-pulse rounded-2xl bg-navy/[0.06]" /></CenteredShell>;
  }

  if (stage === "not-found") {
    return (
      <CenteredShell>
        <p className="font-heading text-lg font-semibold text-navy">This registration link isn&rsquo;t available.</p>
        <p className="mt-2 max-w-sm text-center font-body text-sm text-text-grey">
          It may have expired, or was opened in a different browser than the one that generated it.
        </p>
      </CenteredShell>
    );
  }

  if (!snapshot) return null;

  if (stage === "done") {
    return (
      <CenteredShell>
        <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/50 text-navy">
          <Check size={26} />
        </motion.span>
        <p className="mt-4 font-heading text-lg font-semibold text-navy">Registration Complete</p>
        <p className="mt-1 font-body text-sm text-text-grey">Reference</p>
        <p className="font-heading text-xl font-bold text-navy">{regId}</p>
        <p className="mt-3 max-w-sm font-body text-sm text-text-grey">
          Your details have been submitted for <span className="font-medium text-navy">{snapshot.tripName}</span> and are pending review by the organizer. This confirms submission only — your identity has not yet been verified.
        </p>
        <p className="mt-4 font-body text-sm text-text-grey">You can close this page now.</p>
      </CenteredShell>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 bg-[#FAF8F4] px-5 py-8">
      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Traveler Registration</p>
        <h1 className="font-heading text-xl font-bold text-navy">{snapshot.tripName}</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          Fill in your details below. This submits your information for the organizer&rsquo;s review — it does not verify your identity.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="As per ID document" className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy placeholder:text-text-grey/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>

        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Traveler Type</label>
          <div className="mt-1.5 flex gap-2">
            {TRAVELER_TYPES.map((type) => (
              <button key={type} type="button" onClick={() => setTravelerType(type)} className={cn("rounded-full border px-4 py-1.5 font-body text-sm font-medium capitalize transition-colors", travelerType === type ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy")}>
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">ID Type</label>
            <select value={idType} onChange={(e) => setIdType(e.target.value as IdDocumentType)} className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10">
              {ID_TYPES.map((t) => (
                <option key={t} value={t}>{idTypeLabel(t)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">ID Number</label>
            <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
          </div>
        </div>

        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy placeholder:text-text-grey/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
        </div>

        <button type="button" onClick={() => setHasIdPhoto(!hasIdPhoto)} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors", hasIdPhoto ? "border-orange bg-orange/5" : "border-navy/10")}>
          <ImagePlus size={16} className={hasIdPhoto ? "text-orange" : "text-navy/50"} />
          <span className="font-body text-sm font-medium text-navy">Upload a photo of your ID</span>
          {hasIdPhoto && <Check size={14} className="ml-auto text-orange" />}
        </button>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Emergency Contact Name <span className="normal-case text-text-grey/60">(optional)</span></label>
            <input value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Emergency Contact Phone <span className="normal-case text-text-grey/60">(optional)</span></label>
            <input value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10" />
          </div>
        </div>

        <label className="flex items-start gap-2.5 rounded-xl bg-navy/[0.02] px-4 py-3">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-navy/30" />
          <span className="font-body text-sm text-text-grey">I confirm these details are accurate and consent to sharing them with the trip organizer for travel arrangements.</span>
        </label>
      </div>

      <div className="sticky bottom-0 border-t border-navy/10 bg-[#FAF8F4] py-4">
        <button type="button" disabled={!isValid} onClick={handleSubmit} className="w-full rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40">
          Submit Registration
        </button>
      </div>
    </div>
  );
}

function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#FAF8F4] px-6 text-center">
      {children}
    </div>
  );
}
