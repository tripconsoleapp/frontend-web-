import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDateRange } from "@/lib/mock-trips";

const STEPS = ["Participants", "Passengers", "Summary", "Payment"];

/** The scheduled-departure booking flow is a deliberately different
 *  product journey from the trip-builder (joining vs. building), so it
 *  gets its own compact progress header rather than reusing
 *  `CreateStepper` — a 4-step checkout, not a 5-step trip wizard. */
export function BookingHeader({
  title,
  imageUrl,
  departureDate,
  returnDate,
  backHref,
  activeIndex,
}: {
  title: string;
  imageUrl: string;
  departureDate: string;
  returnDate: string;
  backHref: string;
  activeIndex: number;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-navy/10 pb-5">
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-1.5 font-body text-sm text-text-grey transition-colors hover:text-navy"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
          <Image src={imageUrl} alt="" fill sizes="48px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-semibold text-navy">{title}</p>
          <p className="font-body text-xs text-text-grey">
            {formatDateRange(departureDate, returnDate)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                index <= activeIndex ? "bg-orange" : "bg-navy/10"
              )}
            />
          </div>
        ))}
      </div>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
        Step {activeIndex + 1} of {STEPS.length} &middot; {STEPS[activeIndex]}
      </p>
    </div>
  );
}
