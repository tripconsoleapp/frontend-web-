import Link from "next/link";
import { Landmark } from "lucide-react";

export function PilgrimageBanner() {
  return (
    <div className="relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-warning-soft p-6 lg:flex-row lg:items-center lg:justify-between">
      <div
        aria-hidden="true"
        className="absolute -right-6 -top-10 hidden h-40 w-40 rounded-full border border-warning/20 sm:block"
      >
        <div className="absolute inset-6 rounded-full border border-warning/20" />
      </div>

      <div className="relative z-10 flex min-w-0 items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warning-soft-strong text-warning-soft-foreground">
          <Landmark size={22} />
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold text-navy">
            Planning a Sabarimala or Guruvayur trip?
          </h2>
          <p className="mt-1 max-w-xl font-body text-base text-text-grey">
            Explore dedicated pilgrim itineraries, KSRTC coordination, and
            group management tools.
          </p>
        </div>
      </div>
      <Link
        href="/pilgrimage"
        className="relative z-10 inline-flex w-full shrink-0 items-center justify-center rounded-full bg-warning px-6 py-3 font-body text-base font-semibold text-warning-foreground transition-transform hover:scale-[1.03] hover:bg-warning-hover lg:w-auto"
      >
        Explore Programs
      </Link>
    </div>
  );
}
