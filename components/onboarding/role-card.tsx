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
        "relative flex flex-1 flex-col items-start gap-3 rounded-xl border-2 bg-white p-6 text-left transition-colors",
        selected
          ? "border-mint bg-mint/10"
          : "border-navy/10 hover:border-navy/25"
      )}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-mint text-white">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
        {icon}
      </span>
      <div>
        <h3 className="font-heading font-semibold text-navy">{title}</h3>
        <p className="mt-1 font-body text-sm text-text-grey">{description}</p>
      </div>
    </button>
  );
}
