import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function PrimaryStartOption({
  imageUrl,
  imageAlt,
  coordinate,
  title,
  description,
  ctaLabel,
  href,
}: {
  imageUrl: string;
  imageAlt: string;
  coordinate?: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-2xl lg:h-[620px]"
    >
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        priority
        sizes="(min-width: 1024px) 44vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-navy/5" />

      {coordinate && (
        <span className="absolute left-6 top-6 font-body text-[11px] font-medium uppercase tracking-widest text-white/70">
          {coordinate}
        </span>
      )}

      <div className="relative z-10 flex flex-col gap-3 p-6 sm:p-8">
        <h2 className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-sm font-body text-base text-white/80">{description}</p>
        <span
          className={cn(buttonVariants({ variant: "accent", size: "md" }), "mt-2 w-fit gap-2")}
        >
          {ctaLabel}
          <ArrowRight
            size={18}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
