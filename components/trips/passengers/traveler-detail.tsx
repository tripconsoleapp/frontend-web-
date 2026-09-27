"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, ImageOff, ImagePlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { TripRecord, getTripRecord, saveTripRecord } from "@/lib/listing-draft";
import { idTypeLabel, travelerStatusLabel } from "@/lib/trip-operations";

export function TravelerDetail({ tripId, travelerId }: { tripId: string; travelerId: string }) {
  const router = useRouter();
  const [record, setRecord] = useState<TripRecord | null>(null);
  const [correctionNote, setCorrectionNote] = useState("");
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);

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

  const traveler = record.passengerManagement.travelers.find((t) => t.id === travelerId);

  if (!traveler) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
        <p className="font-heading text-base font-semibold text-navy">This traveler couldn&rsquo;t be found.</p>
        <Link href={`/trips/${tripId}/passengers`} className="font-body text-sm font-semibold text-orange underline underline-offset-2">Back to Roster</Link>
      </div>
    );
  }

  function updateStatus(status: "verified" | "needs_correction", note?: string) {
    if (!record) return;
    const now = new Date().toISOString();
    const travelers = record.passengerManagement.travelers.map((t) =>
      t.id === travelerId ? { ...t, registrationStatus: status, correctionNote: note ?? null, updatedAt: now } : t
    );
    const next: TripRecord = { ...record, passengerManagement: { ...record.passengerManagement, travelers } };
    saveTripRecord(next);
    setRecord(next);
    setShowCorrectionForm(false);
    setCorrectionNote("");
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Link href={`/trips/${tripId}/passengers`} className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
        <ArrowLeft size={14} /> Back to roster
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange capitalize">{traveler.travelerType}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{traveler.name || "Unnamed traveler"}</h1>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-body text-sm font-semibold",
            traveler.registrationStatus === "verified" ? "bg-mint/40 text-navy" : traveler.registrationStatus === "needs_correction" ? "bg-destructive-soft text-destructive" : "bg-navy/[0.06] text-navy"
          )}
        >
          {traveler.registrationStatus === "verified" && <Check size={13} />}
          {traveler.registrationStatus === "needs_correction" && <AlertTriangle size={13} />}
          {travelerStatusLabel(traveler.registrationStatus)}
        </span>
      </div>

      <div className="rounded-2xl border border-navy/10 p-6">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Pending Review</p>
        <p className="mt-1 font-body text-sm text-text-grey">
          This status reflects that the organizer has reviewed the submitted details — it is not an automated or government identity verification.
        </p>

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">{idTypeLabel(traveler.idType)}</dt>
            <dd className="font-body text-sm font-medium text-navy">{traveler.idNumber || "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Phone</dt>
            <dd className="font-body text-sm font-medium text-navy">{traveler.phone || "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">ID Photo</dt>
            <dd className="flex items-center gap-1.5 font-body text-sm font-medium text-navy">
              {traveler.hasIdPhoto ? <ImagePlus size={14} className="text-navy/60" /> : <ImageOff size={14} className="text-text-grey" />}
              {traveler.hasIdPhoto ? "Uploaded" : "Not uploaded"}
            </dd>
          </div>
          <div>
            <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Source</dt>
            <dd className="font-body text-sm font-medium capitalize text-navy">{traveler.source === "link" ? "Self-registered" : traveler.source}</dd>
          </div>
          {(traveler.emergencyContactName || traveler.emergencyContactPhone) && (
            <div>
              <dt className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Emergency Contact</dt>
              <dd className="font-body text-sm font-medium text-navy">
                {traveler.emergencyContactName} {traveler.emergencyContactPhone && `· ${traveler.emergencyContactPhone}`}
              </dd>
            </div>
          )}
        </dl>

        {traveler.correctionNote && (
          <div className="mt-5 rounded-xl bg-destructive-soft px-4 py-3">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-destructive">Correction requested</p>
            <p className="mt-0.5 font-body text-sm text-destructive">{traveler.correctionNote}</p>
          </div>
        )}
      </div>

      {traveler.registrationStatus !== "verified" && !showCorrectionForm && (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => updateStatus("verified")} className="inline-flex items-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90">
            <Check size={14} /> Mark Verified
          </button>
          <button type="button" onClick={() => setShowCorrectionForm(true)} className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-6 py-3 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5">
            Request Correction
          </button>
        </div>
      )}

      {traveler.registrationStatus === "verified" && (
        <button type="button" onClick={() => setShowCorrectionForm(true)} className="inline-flex w-fit items-center gap-1.5 font-body text-sm font-medium text-text-grey underline underline-offset-2 hover:text-navy">
          Reopen for correction
        </button>
      )}

      {showCorrectionForm && (
        <div className="rounded-2xl border border-navy/10 p-6">
          <label className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">What needs to be corrected?</label>
          <textarea
            value={correctionNote}
            onChange={(e) => setCorrectionNote(e.target.value)}
            rows={3}
            placeholder="e.g. ID number doesn't match the uploaded photo"
            className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 font-body text-sm text-navy placeholder:text-text-grey/50 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
          <div className="mt-3 flex gap-3">
            <button type="button" disabled={!correctionNote.trim()} onClick={() => updateStatus("needs_correction", correctionNote.trim())} className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-40">
              Send for Correction
            </button>
            <button type="button" onClick={() => setShowCorrectionForm(false)} className="font-body text-sm font-medium text-text-grey hover:text-navy">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
