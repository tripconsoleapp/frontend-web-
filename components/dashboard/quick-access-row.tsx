import Link from "next/link";
import { FolderOpen, Landmark } from "lucide-react";

const ITEMS = [
  {
    href: "/documents",
    icon: FolderOpen,
    title: "Documents Center",
    description: "Permits, tickets, IDs",
  },
  {
    href: "/pilgrimage-programs",
    icon: Landmark,
    title: "Pilgrimage Programs",
    description: "Sabarimala, Guruvayur & nearby",
  },
];

export function QuickAccessRow() {
  return (
    <div>
      <h2 className="font-heading text-base font-semibold text-navy">
        Quick Access
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {ITEMS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-2 rounded-xl border border-navy/10 bg-white p-4"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/5 text-navy">
              <Icon size={18} />
            </span>
            <span className="font-heading text-sm font-semibold text-navy">
              {title}
            </span>
            <span className="font-body text-xs text-text-grey">
              {description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
