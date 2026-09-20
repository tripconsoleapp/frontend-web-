import Link from "next/link";
import { CarFront, Hotel, Ticket, Utensils } from "lucide-react";

const SERVICES = [
  { href: "/book/hotel", label: "Hotel", icon: Hotel },
  { href: "/book/vehicle", label: "Vehicle", icon: CarFront },
  { href: "/book/restaurant", label: "Restaurant", icon: Utensils },
  { href: "/book/activity", label: "Activity", icon: Ticket },
];

export function QuickBookRow() {
  return (
    <div>
      <p className="font-body text-base font-semibold uppercase tracking-wide text-text-grey">
        Book just one service directly
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SERVICES.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-3 rounded-xl bg-white py-6 font-body text-base font-medium text-navy shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy/5 text-navy">
              <Icon size={20} />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
