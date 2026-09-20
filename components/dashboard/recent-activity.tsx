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
    <div>
      <h2 className="font-heading text-2xl font-semibold text-navy">
        Recent Activity
      </h2>
      <ul className="mt-4 flex flex-col gap-4">
        {ACTIVITY.map(({ icon: Icon, iconClass, text, time }, i) => (
          <li key={i} className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconClass}`}
            >
              <Icon size={15} />
            </span>
            <div className="flex flex-col">
              <span className="font-body text-base text-navy">{text}</span>
              <span className="font-body text-base text-text-grey">{time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
