import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CarFront, Hotel, Ticket, Utensils } from "lucide-react";

const SERVICES = [
  {
    href: "/book/hotel",
    label: "Hotel",
    descriptor: "Accommodation",
    icon: Hotel,
    imageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
  },
  {
    href: "/book/vehicle",
    label: "Vehicle",
    descriptor: "Transport",
    icon: CarFront,
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80",
  },
  {
    href: "/book/restaurant",
    label: "Restaurant",
    descriptor: "Dining",
    icon: Utensils,
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
  },
  {
    href: "/book/activity",
    label: "Activity",
    descriptor: "Experiences",
    icon: Ticket,
    imageUrl:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80",
  },
];

export function ServiceRail() {
  return (
    <div>
      <p className="font-body text-base font-semibold uppercase tracking-wide text-text-grey">
        Book just one service directly
      </p>
      <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:overflow-visible">
        {SERVICES.map(({ href, label, descriptor, icon: Icon, imageUrl }) => (
          <Link
            key={href}
            href={href}
            className="group flex w-[200px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 lg:w-auto"
          >
            <div className="relative h-28 w-full overflow-hidden">
              <Image
                src={imageUrl}
                alt=""
                fill
                sizes="200px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-navy shadow-sm">
                <Icon size={16} />
              </span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-heading text-base font-semibold text-navy">{label}</p>
                <p className="font-body text-xs text-text-grey">{descriptor}</p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-navy transition-transform duration-200 group-hover:translate-x-1"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
