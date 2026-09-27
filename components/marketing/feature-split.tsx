import Image from "next/image";
import { Check, FileCheck, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/mock-trips";
import { getTemplateById } from "@/lib/mock-templates";

const FEATURES = [
  {
    title: "Plan without the spreadsheet chaos",
    description: "Destinations, transport, stays, meals and activities all live in one itinerary.",
  },
  {
    title: "Collect passengers your way",
    description: "Share a link, import a list, or add travelers manually — into one roster, always.",
  },
  {
    title: "Payments tied to what's approved",
    description: "Every rupee is checked against a locked, versioned cost snapshot — never a guess.",
  },
];

export function FeatureSplit() {
  const example = getTemplateById("munnar-nature");

  return (
    <section className="bg-white px-6 py-24 sm:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-[0.14em] text-orange">One calm console</p>
          <h2 className="mt-2 text-[clamp(2rem,3.6vw,3rem)] font-heading font-bold leading-[0.98] text-navy">
            Less tabs. <span className="font-serif italic text-navy">More travel.</span>
          </h2>
          <p className="mt-4 max-w-sm font-body text-base text-text-grey">
            TripConsole keeps the moving parts of a group trip together, from the first destination pin to the last invoice.
          </p>

          <div className="mt-8 flex flex-col gap-5">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange">
                  <Check size={13} />
                </span>
                <p className="font-body text-sm text-text-grey">
                  <span className="font-heading font-semibold text-navy">{feature.title}</span>
                  <br />
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <Link href="/trips/new" className={buttonVariants({ variant: "primary", size: "lg", className: "mt-8" })}>
            See how it works
          </Link>
        </div>

        <div className="relative h-[420px] sm:h-[480px]">
          <div className="absolute inset-0 ml-8 overflow-hidden rounded-2xl sm:ml-16">
            <Image
              src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1400&q=80"
              alt="Kerala backwaters houseboat"
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
            />
          </div>

          <div className="absolute left-0 top-10 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_15px_28px_-8px_rgba(23,40,25,.25)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange/10 text-orange">
              <FileCheck size={17} />
            </span>
            <div className="flex flex-col">
              <span className="font-heading text-sm font-semibold text-navy">Cost Snapshot Locked</span>
              <span className="font-body text-xs text-text-grey">Version 1 &middot; approved</span>
            </div>
          </div>

          {example && (
            <div className="absolute -right-4 bottom-8 flex flex-col gap-1 rounded-xl bg-navy px-4 py-3.5 text-white shadow-[0_15px_28px_-8px_rgba(23,40,25,.3)] sm:right-0">
              <span className="flex items-center gap-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-mint">
                <Sparkles size={11} /> Try a template
              </span>
              <span className="font-serif text-lg italic text-white">{example.name}</span>
              <span className="font-body text-xs text-white/60">
                {example.durationLabel} &middot; from {formatCurrency(example.pricePerPerson)}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
