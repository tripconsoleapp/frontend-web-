import Link from "next/link";
import { CheckCircle2, FileClock, Plane } from "lucide-react";

const ITEMS = [
  { key: "active", label: "Active", icon: Plane, tint: "text-orange" },
  { key: "completed", label: "Completed", icon: CheckCircle2, tint: "text-navy" },
  { key: "draft", label: "Draft", icon: FileClock, tint: "text-navy" },
] as const;

export function QuickOverview({
  counts,
}: {
  counts: { active: number; completed: number; draft: number };
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-navy/10 py-4">
      <span className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
        Trip Overview
      </span>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {ITEMS.map(({ key, label, icon: Icon, tint }, i) => (
          <span key={key} className="flex items-center gap-3">
            <Link
              href={`/trips?status=${key}`}
              className="group flex items-center gap-1.5 font-body text-sm text-navy transition-colors"
            >
              <Icon size={14} className={tint} />
              <span className="font-semibold group-hover:text-orange">
                {counts[key]}
              </span>
              <span className="text-text-grey group-hover:text-orange">{label}</span>
            </Link>
            {i < ITEMS.length - 1 && (
              <span className="text-navy/20" aria-hidden="true">
                &middot;
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
