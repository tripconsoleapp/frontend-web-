import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface WorkspaceHeroProps {
  eyebrow: string;
  heading: string;
  description?: string;
  imageUrl: string;
  imageAlt: string;
  tag?: string;
  progress?: number;
  stepLabel?: string;
  ctaLabel: string;
  ctaHref: string;
  quickStarts?: { label: string; href: string }[];
}

export function WorkspaceHero({
  eyebrow,
  heading,
  description,
  imageUrl,
  imageAlt,
  tag,
  progress,
  stepLabel,
  ctaLabel,
  ctaHref,
  quickStarts,
}: WorkspaceHeroProps) {
  return (
    <div className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-2xl">
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        priority
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/10" />

      {tag && (
        <span className="absolute left-6 top-6 rounded-full bg-white/15 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {tag}
        </span>
      )}

      <div className="relative z-10 flex flex-col gap-5 p-6 sm:p-10">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-mint">
            {eyebrow}
          </p>
          <h2 className="mt-2 max-w-xl font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
            {heading}
          </h2>
          {description && (
            <p className="mt-2 max-w-md font-body text-base text-white/80">
              {description}
            </p>
          )}
        </div>

        {typeof progress === "number" && (
          <div className="max-w-xs">
            <div className="flex items-center justify-between font-body text-sm text-white/85">
              <span>{stepLabel}</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-orange transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={ctaHref}
            className={cn(buttonVariants({ variant: "accent", size: "md" }), "w-fit gap-2")}
          >
            {ctaLabel}
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>

          {quickStarts && quickStarts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {quickStarts.map((option) => (
                <Link
                  key={option.href}
                  href={option.href}
                  className="rounded-full border border-white/25 px-4 py-2 font-body text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  {option.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
