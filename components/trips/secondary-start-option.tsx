import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function SecondaryStartOption({
  visual,
  title,
  description,
  ctaLabel,
  href,
  badge,
}: {
  visual: ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-navy/10 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-md"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-navy/5">
        {visual}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-heading text-base font-semibold text-navy">
            {title}
          </h3>
          {badge && (
            <span className="hidden shrink-0 rounded-full bg-mint/40 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-navy sm:inline-block">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 font-body text-sm text-text-grey">
          {description}
        </p>
      </div>
      <span className="hidden shrink-0 items-center gap-1 font-body text-sm font-semibold text-navy sm:flex">
        {ctaLabel}
        <ArrowRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </span>
      <ArrowRight
        size={16}
        className="shrink-0 text-navy transition-transform duration-200 group-hover:translate-x-1 sm:hidden"
      />
    </Link>
  );
}
