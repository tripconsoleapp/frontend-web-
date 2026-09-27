import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Landmark } from "lucide-react";

/** A real photographic banner, not a flat tinted card with decorative
 *  circles — the pilgrimage program gets the same visual weight as a
 *  destination, not a footnote. */
export function PilgrimageBanner() {
  return (
    <Link
      href="/pilgrimage"
      className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl sm:min-h-[320px]"
    >
      <Image
        src="https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=1800&q=80"
        alt=""
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/45 to-navy/10" />

      <div className="relative z-10 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-10">
        <div className="max-w-lg">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-mint/90 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-navy">
            <Landmark size={12} /> Pilgrimage Program
          </span>
          <h2 className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl">
            Planning a Sabarimala or Guruvayur trip?
          </h2>
          <p className="mt-2 font-body text-base text-white/80">
            Dedicated pilgrim itineraries, KSRTC coordination, and group management tools.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 font-body text-sm font-semibold text-navy transition-transform group-hover:scale-105">
          Explore Programs <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}
