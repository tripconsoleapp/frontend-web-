import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

const STEPS = ["Basics", "Destinations", "Services", "Itinerary", "Review"];

export function CreateStepper({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex w-full items-center">
      {STEPS.map((step, index) => (
        <div
          key={step}
          className={cn(
            "flex items-center",
            index < STEPS.length - 1 && "flex-1"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-body text-base font-semibold transition-colors",
                index < activeIndex
                  ? "bg-mint text-navy"
                  : index === activeIndex
                    ? "bg-orange text-white"
                    : "bg-navy/10 text-text-grey"
              )}
            >
              {index < activeIndex ? <Check size={16} /> : index + 1}
            </span>
            <span
              className={cn(
                "whitespace-nowrap font-body text-xs font-medium",
                index === activeIndex ? "text-navy" : "text-text-grey"
              )}
            >
              {step}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={cn(
                "mx-3 h-px flex-1",
                index < activeIndex ? "bg-mint" : "bg-navy/10"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
