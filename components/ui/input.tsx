import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hint, leftElement, rightElement, className, id, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey"
        >
          {label}
        </label>
        <div className="relative flex items-center">
          {leftElement && (
            <span className="pointer-events-none absolute left-3 flex items-center text-text-grey">
              {leftElement}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border border-navy/10 bg-navy/[0.03] px-4 py-3 font-body text-text-dark placeholder:text-text-grey/60 focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10",
              leftElement && "pl-10",
              rightElement && "pr-10",
              className
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 flex items-center">
              {rightElement}
            </span>
          )}
        </div>
        {hint && (
          <p className="font-body text-xs text-text-grey">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
