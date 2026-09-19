import Link from "next/link";
import { Landmark } from "lucide-react";

export function PilgrimageBanner() {
  return (
    <div className="flex flex-col items-start gap-5 rounded-2xl border border-warning-soft-border bg-warning-soft p-7 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warning-soft-strong text-warning-soft-foreground">
          <Landmark size={22} />
        </span>
        <div>
          <h2 className="font-heading text-xl font-semibold text-navy">
            Planning a Sabarimala or Guruvayur trip?
          </h2>
          <p className="mt-1 max-w-xl font-body text-sm text-text-grey">
            Explore dedicated pilgrim itineraries, KSRTC coordination, and
            group management tools.
          </p>
        </div>
      </div>
      <Link
        href="/pilgrimage"
        className="inline-flex shrink-0 items-center justify-center rounded-md bg-warning px-5 py-2.5 font-body text-sm font-semibold text-warning-foreground hover:bg-warning-hover"
      >
        Explore Programs
      </Link>
    </div>
  );
}
