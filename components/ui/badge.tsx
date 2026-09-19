import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "mint" | "orange" | "navy" | "navy-outline";

const variantClasses: Record<BadgeVariant, string> = {
  mint: "bg-mint text-navy",
  orange: "bg-orange text-white",
  navy: "bg-navy text-white",
  "navy-outline": "border border-navy/20 text-navy",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "mint", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-body font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
