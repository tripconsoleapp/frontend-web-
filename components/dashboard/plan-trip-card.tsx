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
    <div className="flex h-full flex-col justify-center rounded-2xl bg-orange p-8 text-white">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
        <Compass size={22} />
      </span>
      <h2 className="mt-4 font-heading text-2xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md font-body text-base text-white/85">
        {description}
      </p>
      <Link
        href="/trips/new"
        className="mt-6 inline-flex w-fit items-center gap-1 rounded-full bg-white px-6 py-3 font-body text-base font-semibold text-orange"
      >
        Create Trip &rarr;
      </Link>
    </div>
  );
}
