"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Copy, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTripContext } from "@/lib/use-trip-context";
import { RegistrationAccess, TripRecord, getTripRecord, saveTripRecord } from "@/lib/listing-draft";
import { generateRegistrationToken, registrationStats, saveRegistrationSnapshot } from "@/lib/trip-operations";

export function InviteTravelers({ tripId }: { tripId: string }) {
  const router = useRouter();
  const trip = useTripContext();
  const [record, setRecord] = useState<TripRecord | null>(null);
  const [copied, setCopied] = useState(false);

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

  const token = record.passengerManagement.registrationLinkToken;
  const registrationUrl = token && typeof window !== "undefined" ? `${window.location.origin}/register/${token}` : "";
  const stats = registrationStats(record.passengerManagement.travelers, trip.passengerCount);

  function persist(next: TripRecord) {
    saveTripRecord(next);
    setRecord(next);
  }

  function handleGenerate() {
    const newToken = generateRegistrationToken();
    saveRegistrationSnapshot({ token: newToken, tripId: record!.id, tripName: trip.tripName || "Your Trip", expectedCount: trip.passengerCount });
    persist({
      ...record!,
      passengerManagement: { ...record!.passengerManagement, registrationLinkToken: newToken, registrationStatus: record!.passengerManagement.travelers.length > 0 ? record!.passengerManagement.registrationStatus : "open" },
    });
  }

  function setAccess(access: RegistrationAccess) {
    persist({ ...record!, passengerManagement: { ...record!.passengerManagement, registrationAccess: access } });
  }

  function handleCopy() {
    if (!registrationUrl) return;
    navigator.clipboard?.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Link href={`/trips/${tripId}/passengers`} className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
        <ArrowLeft size={14} /> Back to passengers
      </Link>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Invite Travelers</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Share Registration Link</h1>
        <p className="mt-1 font-body text-sm text-text-grey">Send this link to your group. Each person fills in their own name, ID details, and uploads their photo.</p>
      </div>

      {!token ? (
        <div className="rounded-2xl border border-navy/10 p-6">
          <p className="font-body text-sm text-navy">Generate a unique registration link for {trip.tripName || "this trip"}.</p>
          <motion.button type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleGenerate} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90">
            Generate Share Link
          </motion.button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-navy/10 p-6">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Registration Link</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input readOnly value={registrationUrl} className="flex-1 rounded-xl border border-navy/15 bg-navy/[0.03] px-3 py-2.5 font-body text-sm text-navy" />
              <button type="button" onClick={handleCopy} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-navy/20 px-4 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5">
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`https://wa.me/?text=${encodeURIComponent(`Register for ${trip.tripName || "our trip"}: ${registrationUrl}`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-mint/40 px-4 py-2 font-body text-sm font-semibold text-navy transition-colors hover:bg-mint/60">
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a href={`mailto:?subject=${encodeURIComponent(`Register for ${trip.tripName || "our trip"}`)}&body=${encodeURIComponent(registrationUrl)}`} className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-4 py-2 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5">
                <Mail size={14} /> Email
              </a>
            </div>

            <div className="mt-5 border-t border-navy/10 pt-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Who can register</p>
              <div className="mt-2 flex gap-2">
                {([
                  ["anyone_with_link", "Anyone with the link"],
                  ["invited_only", "Invited travelers only"],
                ] as const).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setAccess(value)} className={cn("rounded-full border px-3.5 py-1.5 font-body text-sm font-medium transition-colors", record.passengerManagement.registrationAccess === value ? "border-orange bg-orange/10 text-orange" : "border-navy/15 text-navy hover:border-navy/30")}>
                    {label}
                  </button>
                ))}
              </div>
              {record.passengerManagement.registrationAccess === "invited_only" && (
                <p className="mt-2 font-body text-xs text-text-grey">
                  Invitation-only access limits registration to travelers you&rsquo;ve explicitly added — this build treats the link the same either way since there&rsquo;s no invite-list backend yet.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-navy/[0.02] px-6 py-5">
            <div>
              <p className="font-heading text-lg font-bold text-navy">{stats.registered} / {stats.expected} registered</p>
              <p className="font-body text-sm text-text-grey">{stats.remaining} remaining</p>
            </div>
            <button type="button" onClick={() => router.push(`/trips/${tripId}/passengers`)} className="inline-flex items-center gap-1.5 rounded-full bg-navy px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90">
              View Roster <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
