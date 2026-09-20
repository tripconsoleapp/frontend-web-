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
    <div className="flex h-full flex-col justify-center gap-4 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="font-heading text-2xl font-semibold text-navy">
        Trip Overview
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {LABELS.map(({ key, label }) => (
          <div key={key}>
            <p className="font-heading text-4xl font-bold text-navy">
              {counts[key]}
            </p>
            <p className="font-body text-base text-text-grey">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
