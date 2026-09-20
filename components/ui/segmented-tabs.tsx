import { cn } from "@/lib/cn";

interface TabOption {
  value: string;
  label: string;
}

interface SegmentedTabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedTabs({ options, value, onChange }: SegmentedTabsProps) {
  return (
    <div className="flex gap-6 border-b border-navy/10">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "-mb-px border-b-2 pb-3 font-body text-base font-semibold transition-colors",
            value === option.value
              ? "border-orange text-orange"
              : "border-transparent text-text-grey hover:text-navy"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
