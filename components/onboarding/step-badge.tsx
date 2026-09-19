export function StepBadge({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-navy/60">
      Step {step} of {total} — {label}
    </span>
  );
}
