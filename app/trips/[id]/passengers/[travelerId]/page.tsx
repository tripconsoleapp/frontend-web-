import { AppShell } from "@/components/layout/app-shell";
import { TravelerDetail } from "@/components/trips/passengers/traveler-detail";

export default async function TravelerDetailRoute({
  params,
}: {
  params: Promise<{ id: string; travelerId: string }>;
}) {
  const { id, travelerId } = await params;

  return (
    <AppShell>
      <TravelerDetail tripId={id} travelerId={travelerId} />
    </AppShell>
  );
}
