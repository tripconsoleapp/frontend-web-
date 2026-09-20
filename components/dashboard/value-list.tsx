import { Check } from "lucide-react";

const DEFAULT_FEATURES = [
  "Auto-generated itinerary",
  "Transparent cost console",
  "Institutional-grade approval documents",
];

export function ValueList({
  features = DEFAULT_FEATURES,
}: {
  features?: string[];
}) {
  return (
    <ul className="flex flex-col gap-3">
      {features.map((feature) => (
        <li
          key={feature}
          className="flex items-center gap-3 font-body text-base text-text-grey"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/40 text-navy">
            <Check size={12} />
          </span>
          {feature}
        </li>
      ))}
    </ul>
  );
}
