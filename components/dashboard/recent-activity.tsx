import { BellRing, CheckCircle2, PenLine } from "lucide-react";

const ACTIVITY = [
  {
    icon: CheckCircle2,
    iconClass: "bg-mint/40 text-navy",
    text: "Heritage South Trail submitted",
    time: "2 hours ago",
  },
  {
    icon: PenLine,
    iconClass: "bg-navy/5 text-navy",
    text: "Munnar Draft updated",
    time: "5 hours ago",
  },
  {
    icon: BellRing,
    iconClass: "bg-orange/10 text-orange",
    text: "Payment reminder: Kerala Travels",
    time: "Yesterday",
  },
];

export function RecentActivity() {
  return (
    <div className="rounded-2xl border border-navy/[0.06] bg-white p-6">
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Your trail</p>
      <h2 className="mt-1.5 font-heading text-lg font-bold text-navy">Recent Activity</h2>

      <ul className="mt-4 flex flex-col divide-y divide-navy/[0.06]">
        {ACTIVITY.map(({ icon: Icon, iconClass, text, time }, i) => (
          <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
              <Icon size={14} />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-body text-sm text-navy">{text}</span>
              <span className="font-body text-xs text-text-grey">{time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
