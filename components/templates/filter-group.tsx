import { ReactNode } from "react";

export function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
        {title}
      </h3>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}

export function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 font-body text-sm text-navy">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-navy/30 text-orange focus:ring-orange/30"
      />
      {label}
    </label>
  );
}
