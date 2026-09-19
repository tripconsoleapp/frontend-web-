import Link from "next/link";
import { Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PilgrimageBanner() {
  return (
    <div className="rounded-2xl border border-mint/60 bg-mint/15 p-5">
      <Badge variant="mint" className="w-fit gap-1.5">
        <Landmark size={12} /> Pilgrimage Programs
      </Badge>
      <h2 className="mt-3 font-heading text-lg font-semibold text-navy">
        Planning a Sabarimala or Guruvayur trip?
      </h2>
      <p className="mt-1 font-body text-sm text-text-grey">
        Explore dedicated pilgrim itineraries, KSRTC coordination, and group
        management tools.
      </p>
      <Link
        href="/pilgrimage-programs"
        className="mt-3 inline-flex items-center gap-1 font-body text-sm font-semibold text-navy underline"
      >
        Explore Pilgrimage Programs &rarr;
      </Link>
    </div>
  );
}
