const LABELS = [
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "draft", label: "Draft" },
] as const;

export function StatsSummary({
  counts,
}: {
  counts: { active: number; completed: number; draft: number };
}) {
  return (
    <div className="flex h-full flex-col justify-center gap-5 rounded-2xl border border-navy/10 bg-white p-6">
      <h2 className="font-heading text-base font-semibold text-navy">
        Trip Overview
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {LABELS.map(({ key, label }) => (
          <div key={key}>
            <p className="font-heading text-2xl font-bold text-navy">
              {counts[key]}
            </p>
            <p className="font-body text-xs text-text-grey">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
