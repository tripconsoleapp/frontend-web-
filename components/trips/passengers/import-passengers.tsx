"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertTriangle, ArrowLeft, Check, Download, Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTripContext } from "@/lib/use-trip-context";
import { TripRecord, getTripRecord, saveTripRecord } from "@/lib/listing-draft";
import { CSV_TEMPLATE, ImportRow, deriveRegistrationStatus, importRowToTraveler, parseCsv, validateImportRows } from "@/lib/trip-operations";

export function ImportPassengers({ tripId }: { tripId: string }) {
  const router = useRouter();
  const trip = useTripContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [record, setRecord] = useState<TripRecord | null>(null);
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [imported, setImported] = useState(false);

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

  function handleDownloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "traveler-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setRows(validateImportRows(parseCsv(text)));
    };
    reader.readAsText(file);
  }

  function removeRow(rowNumber: number) {
    setRows((cur) => (cur ? cur.filter((r) => r.rowNumber !== rowNumber) : cur));
  }

  function handleImport() {
    if (!rows || !record) return;
    const validRows = rows.filter((r) => r.issues.length === 0);
    const newTravelers = validRows.map(importRowToTraveler);
    const travelers = [...record.passengerManagement.travelers, ...newTravelers];
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
    setImported(true);
  }

  const validCount = rows?.filter((r) => r.issues.length === 0).length ?? 0;
  const issueCount = rows?.filter((r) => r.issues.length > 0).length ?? 0;

  if (imported) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/50 text-navy">
          <Check size={26} />
        </span>
        <h1 className="font-heading text-xl font-bold text-navy">{validCount} traveler{validCount === 1 ? "" : "s"} imported</h1>
        <button type="button" onClick={() => router.push(`/trips/${tripId}/passengers`)} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-navy/90">
          Back to Roster
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Link href={`/trips/${tripId}/passengers`} className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
        <ArrowLeft size={14} /> Back to passengers
      </Link>

      <div>
        <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Import Passenger List</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-navy">Upload Traveler List</h1>
        <p className="mt-1 font-body text-sm text-text-grey">
          Columns: Full Name, Traveler Type, ID Type, ID Number, Phone Number. This build accepts CSV files — no spreadsheet library is bundled for true .xlsx parsing.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleDownloadTemplate} className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-5 py-2.5 font-body text-sm font-semibold text-navy transition-colors hover:bg-navy/5">
          <Download size={14} /> Download Template
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90">
          <Upload size={14} /> Upload CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
      </div>

      {rows && (
        <>
          <div>
            <p className="font-body text-sm text-navy">
              <span className="font-semibold">{rows.length} rows detected</span> in {fileName}
            </p>
            <p className="mt-1 font-body text-sm text-text-grey">
              {validCount} valid &middot; {issueCount > 0 && <span className="font-medium text-orange">{issueCount} need attention</span>}
            </p>
          </div>

          <div className="flex flex-col divide-y divide-navy/10">
            {rows.map((row) => (
              <div key={row.rowNumber} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-body text-sm font-semibold text-navy">
                    {row.issues.length === 0 ? <Check size={13} className="text-navy" /> : <AlertTriangle size={13} className="text-orange" />}
                    {row.name || `Row ${row.rowNumber}`}
                  </p>
                  <p className="font-body text-xs text-text-grey">{row.travelerType} &middot; {row.idNumber || "no ID"} &middot; {row.phone || "no phone"}</p>
                  {row.issues.length > 0 && (
                    <ul className="mt-1 flex flex-col gap-0.5">
                      {row.issues.map((issue) => (
                        <li key={issue} className="font-body text-xs text-orange">{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {row.issues.length > 0 && (
                  <button type="button" onClick={() => removeRow(row.rowNumber)} className="shrink-0 font-body text-xs font-medium text-text-grey underline underline-offset-2 hover:text-destructive">
                    Remove row
                  </button>
                )}
              </div>
            ))}
          </div>

          <motion.button
            type="button"
            whileHover={validCount > 0 ? { y: -1 } : undefined}
            whileTap={validCount > 0 ? { scale: 0.98 } : undefined}
            disabled={validCount === 0}
            onClick={handleImport}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Import {validCount} Valid Traveler{validCount === 1 ? "" : "s"}
          </motion.button>
        </>
      )}
    </div>
  );
}
