import { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface RoleCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export function RoleCard({
  icon,
  title,
  description,
  selected,
  onSelect,
}: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border-2 bg-white p-4 text-left shadow-sm transition-colors",
        selected
          ? "border-mint bg-mint/10 shadow-md"
          : "border-navy/10 hover:border-navy/25"
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
        {icon}
      </span>
      <div className="flex-1">
        <h3 className="font-heading text-base font-semibold text-navy">
          {title}
        </h3>
        <p className="mt-1 font-body text-base text-text-grey">
          {description}
        </p>
      </div>
      {selected && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-white">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
