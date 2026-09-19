"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, hint, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        label={label}
        hint={hint}
        rightElement={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-text-grey hover:text-navy"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
        {...props}
      />
    );
  }
);
PasswordInput.displayName = "PasswordInput";

const STRENGTH_LABELS = ["Weak", "Fair", "Medium", "Strong"] as const;

function getStrength(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.max(1, score);
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getStrength(password);
  const label = STRENGTH_LABELS[strength - 1];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full bg-navy/10",
              i < strength &&
                (strength <= 1
                  ? "bg-orange"
                  : strength === 2
                  ? "bg-orange"
                  : strength === 3
                  ? "bg-mint"
                  : "bg-mint")
            )}
          />
        ))}
      </div>
      {password && (
        <p className="font-body text-xs text-text-grey">
          Strength: <span className="font-medium text-text-dark">{label}</span>
        </p>
      )}
    </div>
  );
}
