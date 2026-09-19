const COLORS = ["bg-mint", "bg-navy/70", "bg-orange/80"];

export function AvatarGroup({
  count = 3,
  label,
}: {
  count?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-3">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={`h-8 w-8 rounded-full border-2 border-white ${COLORS[i % COLORS.length]}`}
          />
        ))}
      </div>
      <span className="font-body text-sm text-text-grey">{label}</span>
    </div>
  );
}
