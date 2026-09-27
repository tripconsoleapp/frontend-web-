import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CarFront, Hotel, Ticket, Utensils } from "lucide-react";

const SERVICES = [
  {
    href: "/book/hotel",
    label: "Hotel",
    descriptor: "Accommodation",
    icon: Hotel,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=500&q=80",
  },
  {
    href: "/book/vehicle",
    label: "Vehicle",
    descriptor: "Transport",
    icon: CarFront,
    imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=500&q=80",
  },
  {
    href: "/book/restaurant",
    label: "Restaurant",
    descriptor: "Dining",
    icon: Utensils,
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
  },
  {
    href: "/book/activity",
    label: "Activity",
    descriptor: "Experiences",
    icon: Ticket,
    imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=500&q=80",
  },
];

/** Image-led collection — the label lives ON the photo, not in a caption
 *  strip below it, so this reads as a set of travel photographs you pick
 *  from rather than four identical icon+title+button cards. */
export function ServiceCollection() {
  return (
    <div>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-orange">Just one thing to book?</p>
      <h2 className="mt-1.5 font-heading text-2xl font-bold text-navy">Book a single service</h2>

      <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:overflow-visible">
        {SERVICES.map(({ href, label, descriptor, icon: Icon, imageUrl }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex h-48 w-[220px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-2xl lg:h-56 lg:w-auto"
          >
            <Image src={imageUrl} alt="" fill sizes="(min-width: 1024px) 22vw, 220px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
            <Icon size={16} className="absolute right-4 top-4 z-10 text-white/70 transition-colors group-hover:text-white" />
            <div className="relative z-10 flex items-end justify-between gap-2 p-4">
              <div>
                <p className="font-heading text-base font-semibold text-white">{label}</p>
                <p className="font-body text-xs text-white/75">{descriptor}</p>
              </div>
              <ArrowUpRight size={16} className="shrink-0 text-white/70 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
