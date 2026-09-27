import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function ClosingCta() {
  return (
    <section className="px-6 py-16 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-2xl bg-mint/25 px-8 py-12 text-center sm:flex-row sm:px-14 sm:text-left">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-[0.14em] text-navy/60">Ready when you are</p>
          <h2 className="mt-2 max-w-md text-[clamp(1.6rem,2.8vw,2.3rem)] font-heading font-bold leading-[1.05] text-navy">
            Start planning your next group trip.
          </h2>
        </div>
        <Link href="/trips/new" className={buttonVariants({ variant: "primary", size: "lg", className: "shrink-0" })}>
          Start a Trip <ArrowRight size={16} className="ml-1.5" />
        </Link>
      </div>
    </section>
  );
}
