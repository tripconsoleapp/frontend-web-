"use client";

import { useState } from "react";
import { Users, X } from "lucide-react";
import { CounterInput } from "@/components/ui/counter-input";
import { Button } from "@/components/ui/button";

export interface GuestSelection {
  adults: number;
  children: number;
  childrenAges: number[];
  rooms: number;
}

export function guestSummaryLabel(s: GuestSelection): string {
  const parts = [`${s.adults} Adult${s.adults === 1 ? "" : "s"}`];
  if (s.children > 0) parts.push(`${s.children} Child${s.children === 1 ? "" : "ren"}`);
  parts.push(`${s.rooms} Room${s.rooms === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

export function GuestSelector({
  value,
  onChange,
  maxRooms = 8,
}: {
  value: GuestSelection;
  onChange: (next: GuestSelection) => void;
  maxRooms?: number;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<GuestSelection>(value);

  function openPanel() {
    setDraft(value);
    setOpen(true);
  }

  function setChildren(count: number) {
    const ages = Array.from({ length: count }, (_, i) => draft.childrenAges[i] ?? 8);
    setDraft({ ...draft, children: count, childrenAges: ages });
  }

  function setChildAge(index: number, age: number) {
    const ages = [...draft.childrenAges];
    ages[index] = age;
    setDraft({ ...draft, childrenAges: ages });
  }

  function apply() {
    onChange(draft);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPanel}
        className="flex w-full items-center gap-2.5 rounded-xl border border-navy/15 bg-white px-4 py-3 text-left font-body text-sm text-navy transition-colors hover:border-navy/30"
      >
        <Users size={16} className="shrink-0 text-text-grey" />
        <span>{guestSummaryLabel(value)}</span>
      </button>

      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 px-0 sm:items-center sm:px-4">
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold text-navy">Guests &amp; Rooms</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1 text-text-grey hover:bg-navy/5">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <CounterInput label="Adults" value={draft.adults} onChange={(v) => setDraft({ ...draft, adults: v })} min={1} max={30} />
              <CounterInput label="Children" value={draft.children} onChange={setChildren} min={0} max={10} />
              <CounterInput label="Rooms" value={draft.rooms} onChange={(v) => setDraft({ ...draft, rooms: v })} min={1} max={maxRooms} />

              {draft.children > 0 && (
                <div className="flex flex-col gap-2 rounded-xl bg-navy/[0.03] p-3">
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">Children&rsquo;s ages</p>
                  <div className="grid grid-cols-2 gap-2">
                    {draft.childrenAges.map((age, i) => (
                      <label key={i} className="flex flex-col gap-1">
                        <span className="font-body text-xs text-text-grey">Child {i + 1}</span>
                        <select
                          value={age}
                          onChange={(e) => setChildAge(i, Number(e.target.value))}
                          className="rounded-lg border border-navy/15 bg-white px-2.5 py-2 font-body text-sm text-navy"
                        >
                          {Array.from({ length: 17 }, (_, n) => n + 1).map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? "year" : "years"}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button type="button" variant="accent" className="mt-5 w-full" onClick={apply}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
