import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface StartOptionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
}

export function StartOptionCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  href,
}: StartOptionCardProps) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-navy/10 bg-white p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint/40 text-navy">
        <Icon size={20} />
      </span>
      <h2 className="font-heading text-base font-semibold text-navy">
        {title}
      </h2>
      <p className="flex-1 font-body text-sm text-text-grey">{description}</p>
      <Link
        href={href}
        className={buttonVariants({
          variant: "outline",
          className: "w-full justify-center",
        })}
      >
        {buttonLabel}
      </Link>
    </div>
  );
}
