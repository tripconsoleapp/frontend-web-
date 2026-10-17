export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/20 bg-destructive-soft px-4 py-3 font-body text-sm text-destructive"
    >
      {message}
    </p>
  );
}
