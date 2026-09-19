import Link from "next/link";
import { Check, ClipboardList } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const FEATURES = [
  "Auto-generated itinerary",
  "Transparent cost console",
  "Institutional-grade approval documents",
];

export function TripsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-navy/10 bg-white px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/40 text-navy">
        <ClipboardList size={26} />
      </span>
      <h2 className="font-heading text-lg font-semibold text-navy">
        No trips yet
      </h2>
      <ul className="flex flex-col gap-2 text-left">
        {FEATURES.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 font-body text-sm text-text-grey"
          >
            <Check size={15} className="shrink-0 text-mint" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/trips/new"
        className={buttonVariants({
          variant: "accent",
          size: "lg",
          className: "w-full",
        })}
      >
        Create Your First Trip
      </Link>
      <Link
        href="/templates"
        className="font-body text-sm text-navy underline"
      >
        Browse reference templates
      </Link>
    </div>
  );
}
