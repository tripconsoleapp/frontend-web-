import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-navy text-white hover:bg-navy/90",
  accent: "bg-orange text-white hover:bg-orange/90",
  outline: "border border-navy text-navy hover:bg-navy/5",
  ghost: "text-navy hover:bg-navy/5",
};

/* Buttons are the highest-emphasis interactive element, so they carry
   the roundest corners in the system — cards use rounded-2xl (16px),
   inputs use rounded-xl (12px), buttons use a full pill. Text sizes
   collapse "lg" into the same 16px body size as "md" so pages that mix
   button sizes don't pick up a one-off font size found nowhere else. */
const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-full",
  md: "px-6 py-3 text-base rounded-full",
  lg: "px-8 py-4 text-base rounded-full",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center font-body font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
