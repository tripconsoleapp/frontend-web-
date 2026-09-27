import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Landmark,
  Mountain,
  Users,
} from "lucide-react";

const CATEGORIES = [
  { id: "school", label: "School Trips", description: "Excursions & study tours", icon: GraduationCap },
  { id: "pilgrimage", label: "Pilgrimage", description: "Routes, timings & coordination", icon: Landmark },
  { id: "family", label: "Family", description: "Reunions & getaways", icon: Users },
  { id: "corporate", label: "Corporate", description: "Offsites & incentive trips", icon: Briefcase },
];

/** Real links into Templates, styled as a soft-tinted category band —
 *  no fabricated trip counts per category. */
export function CategoryNav() {
  return (
    <section className="bg-mint/[0.12] px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.14em] text-orange">Choose your pace</p>
        <h2 className="mt-2 text-[clamp(1.6rem,2.6vw,2.2rem)] font-heading font-bold leading-[1.05] text-navy">
          Explore by travel type
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(({ id, label, description, icon: Icon }) => (
            <Link
              key={id}
              href={`/templates?category=${id}`}
              className="group flex items-center gap-3 rounded-xl border border-navy/[0.08] bg-white/70 p-4 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_25px_-8px_rgba(45,62,80,0.15)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-mint/50 text-navy">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="font-heading text-sm font-semibold text-navy">{label}</span>
                <span className="font-body text-xs text-text-grey">{description}</span>
              </span>
              <ArrowRight size={16} className="shrink-0 text-navy/30 transition-colors group-hover:text-orange" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
