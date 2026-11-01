import Link from "next/link";
import Image from "next/image";

interface ServiceItem {
  href: string;
  label: string;
  descriptor: string;
  imageUrl: string;
}

const HOTEL: ServiceItem = {
  href: "/book/hotel",
  label: "Hotel",
  descriptor: "Accommodation",
  imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
};
// Reuses the "AC Sleeper Bus" category photo already in the project
// (lib/vehicle-booking-data.ts's IMG.acSleeper) instead of the generic
// sports car this tile used to show — a bus/coach photo fits a
// transport-booking tile (and sits next to the KSRTC tickets pill)
// far better than a sedan.
const VEHICLE: ServiceItem = {
  href: "/book/vehicle",
  label: "Vehicle",
  descriptor: "Transport",
  imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80",
};
const RESTAURANT: ServiceItem = {
  href: "/book/restaurant",
  label: "Restaurant",
  descriptor: "Dining",
  imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
};
const ACTIVITY: ServiceItem = {
  href: "/book/activity",
  label: "Activity",
  descriptor: "Experiences",
  imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
};

/** One photo tile — a subtle bottom-only darkening behind the title, not
 *  a gradient across the whole image. The Vehicle tile additionally
 *  carries a small, separately-clickable "KSRTC tickets" pill, which is
 *  why the card body is a plain div with the photo as its own full-cover
 *  Link rather than the tile itself being one big anchor. */
function ServiceTile({ item, className }: { item: ServiceItem; className?: string }) {
  const isVehicle = item.href === "/book/vehicle";

  return (
    <div className={`group relative overflow-hidden rounded-[20px] ${className ?? ""}`}>
      <Link href={item.href} aria-label={item.label} className="absolute inset-0 z-0">
        <Image src={item.imageUrl} alt="" fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
        <div
          className="absolute inset-x-0 bottom-0 h-[45%]"
          style={{ background: "linear-gradient(to top, rgba(20,30,40,0.65), rgba(20,30,40,0))" }}
        />
      </Link>

      {isVehicle && (
        <Link
          href="/tickets/search"
          className="absolute left-4 top-4 z-20 rounded-xl bg-white/90 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wide text-navy transition-colors hover:bg-white"
        >
          KSRTC tickets
        </Link>
      )}

      {/* Anchored to the bottom edge (not stretched via a tall flex
         column) so the label+title always sit fully inside the 45%
         darkened band above, however short the tile is. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
        <p className="font-body text-[11px] font-semibold uppercase tracking-wide text-white/90">{item.descriptor}</p>
        <p className="mt-0.5 font-serif text-lg text-white sm:text-xl">{item.label}</p>
      </div>
    </div>
  );
}

/** Asymmetric editorial grid — a tall Hotel tile on the left, a wide
 *  Vehicle tile top right, Restaurant and Activity as two small tiles
 *  underneath it — rather than four identical equal-width squares. */
export function ServiceCollection() {
  return (
    <div>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Just one thing to book?</p>
      <h2 className="mt-1.5 font-serif text-2xl text-navy">Book a single service</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ServiceTile item={HOTEL} className="h-64 lg:h-full" />
        <div className="flex flex-col gap-4">
          <ServiceTile item={VEHICLE} className="h-40" />
          <div className="grid grid-cols-2 gap-4">
            <ServiceTile item={RESTAURANT} className="h-32" />
            <ServiceTile item={ACTIVITY} className="h-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
