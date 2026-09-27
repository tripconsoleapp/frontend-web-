import { AppShell } from "@/components/layout/app-shell";
import { VerificationStatus } from "@/components/trips/verification/verification-status";

export default async function VerificationRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <VerificationStatus tripId={id} />
    </AppShell>
  );
}
