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
      <h2 className="mt-4 font-heading text-xl font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-md font-body text-sm text-white/85">
        {description}
      </p>
      <Link
        href="/trips/new"
        className="mt-5 inline-flex w-fit items-center gap-1 rounded-md bg-white px-5 py-2.5 font-body text-sm font-semibold text-orange"
      >
        Create Trip &rarr;
      </Link>
    </div>
  );
}
