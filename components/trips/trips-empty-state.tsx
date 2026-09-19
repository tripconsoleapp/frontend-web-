import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ValueList } from "@/components/dashboard/value-list";

export function TripsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-navy/10 bg-white px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/40 text-navy">
        <ClipboardList size={26} />
      </span>
      <h2 className="font-heading text-lg font-semibold text-navy">
        No trips yet
      </h2>
      <ValueList />
      <Link
        href="/trips/new"
        className={buttonVariants({
          variant: "accent",
          size: "lg",
          className: "mt-2 w-full max-w-xs",
        })}
      >
        Create Your First Trip
      </Link>
      <Link
        href="/templates"
        className="font-body text-sm text-navy underline"
      >
        Browse Templates
      </Link>
    </div>
  );
}
