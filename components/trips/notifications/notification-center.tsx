"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Bell, CheckCheck, CircleCheck, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { TripNotification, TripRecord, getTripRecord, saveTripRecord } from "@/lib/listing-draft";

const SEVERITY_ICON: Record<TripNotification["severity"], typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: AlertTriangle,
  action_required: AlertTriangle,
};

const SEVERITY_CLASS: Record<TripNotification["severity"], string> = {
  info: "bg-navy/[0.06] text-navy",
  success: "bg-mint/50 text-navy",
  warning: "bg-orange/15 text-orange",
  action_required: "bg-destructive-soft text-destructive",
};

function dayGroup(iso: string): "Today" | "Yesterday" | "Earlier" {
  const date = new Date(iso);
  const now = new Date();
  const dayMs = 86400000;
  const diffDays = Math.floor((new Date(now.toDateString()).getTime() - new Date(date.toDateString()).getTime()) / dayMs);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}

export function NotificationCenter({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [record, setRecord] = useState<TripRecord | null>(null);

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

  const sorted = [...record.notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const groups: Record<string, TripNotification[]> = { Today: [], Yesterday: [], Earlier: [] };
  for (const n of sorted) groups[dayGroup(n.createdAt)].push(n);
  const unreadCount = record.notifications.filter((n) => !n.read).length;

  function persist(next: TripRecord) {
    saveTripRecord(next);
    setRecord(next);
  }

  function markRead(id: string) {
    if (!record) return;
    persist({ ...record, notifications: record.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
  }

  function markAllRead() {
    if (!record) return;
    persist({ ...record, notifications: record.notifications.map((n) => ({ ...n, read: true })) });
  }

  function handleClick(n: TripNotification) {
    markRead(n.id);
    if (n.actionHref) router.push(n.actionHref);
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <Link href={`/trips/${tripId}/operations`} className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy">
        <ArrowLeft size={14} /> Back to operations
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">Notifications</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-navy">{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}</h1>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1.5 font-body text-sm font-semibold text-orange underline underline-offset-2">
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
          <Bell size={20} className="text-text-grey" />
          <p className="font-body text-sm text-text-grey">Nothing here yet — notifications appear as your trip progresses.</p>
        </div>
      ) : (
        Object.entries(groups)
          .filter(([, items]) => items.length > 0)
          .map(([label, items]) => (
            <div key={label}>
              <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">{label}</p>
              <div className="mt-2 flex flex-col divide-y divide-navy/10 rounded-2xl border border-navy/10">
                {items.map((n) => {
                  const Icon = SEVERITY_ICON[n.severity];
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleClick(n)}
                      className={cn("flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-navy/[0.02]", !n.read && "bg-navy/[0.015]")}
                    >
                      <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", SEVERITY_CLASS[n.severity])}>
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 font-body text-sm font-semibold text-navy">
                          {n.title}
                          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />}
                        </p>
                        <p className="mt-0.5 font-body text-sm text-text-grey">{n.message}</p>
                        <p className="mt-1 font-body text-xs text-text-grey/70">{new Date(n.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
