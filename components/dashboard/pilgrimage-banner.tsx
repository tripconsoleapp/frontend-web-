import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

/** A split band, not a photo-with-text-on-top banner — a warm off-white
 *  panel on the left (clearly distinct from the rest of the white page)
 *  and the temple photo filling the full height on the right. Only the
 *  outer corners round; the seam between panel and photo stays sharp. */
export function PilgrimageBanner() {
  return (
    <Link
      href="/pilgrimage"
      className="group flex min-h-[300px] flex-col overflow-hidden sm:flex-row"
    >
      <div className="flex flex-1 flex-col justify-center gap-4 rounded-t-[24px] bg-[#F6F2EB] px-6 py-10 sm:rounded-l-[24px] sm:rounded-tr-none sm:px-10 sm:py-12">
        <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Pilgrimage Program</p>
        <div>
          <h2 className="font-serif text-2xl leading-tight text-navy sm:text-3xl">Planning a Sabarimala or Guruvayur trip?</h2>
          <p className="mt-2 font-body text-sm text-text-grey">ശബരിമല &middot; ഗുരുവായൂർ</p>
        </div>
        <p className="max-w-sm font-body text-base text-text-grey">
          Dedicated pilgrim itineraries, KSRTC coordination, and group management tools.
        </p>
        <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-orange px-6 py-3 font-body text-sm font-semibold text-white transition-colors group-hover:bg-orange/90">
          Explore Programs
          <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>

      <div className="relative h-56 flex-1 overflow-hidden rounded-b-[24px] sm:h-auto sm:rounded-b-none sm:rounded-r-[24px]">
        <Image
          src="https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=1400&q=80"
          alt=""
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
    </Link>
  );
}
