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
    <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md py-2 font-body text-sm font-semibold transition-colors",
            value === option.value
              ? "bg-orange text-white"
              : "text-navy hover:bg-white"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
