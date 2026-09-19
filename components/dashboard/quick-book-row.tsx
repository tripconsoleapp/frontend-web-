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
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
        Or book just one service directly
      </p>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {SERVICES.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border border-navy/10 bg-white py-4 font-body text-xs font-medium text-navy hover:border-navy/25"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/5 text-navy">
              <Icon size={18} />
            </span>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
