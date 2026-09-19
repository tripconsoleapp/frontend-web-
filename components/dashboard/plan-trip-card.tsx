import Link from "next/link";
import { Compass } from "lucide-react";

export function PlanTripCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-orange p-5 text-white">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
        <Compass size={20} />
      </span>
      <h2 className="mt-3 font-heading text-lg font-semibold">{title}</h2>
      <p className="mt-1 font-body text-sm text-white/85">{description}</p>
      <Link
        href="/trips/new"
        className="mt-4 inline-flex items-center gap-1 rounded-md bg-white px-4 py-2 font-body text-sm font-semibold text-orange"
      >
        Create Trip &rarr;
      </Link>
    </div>
  );
}
