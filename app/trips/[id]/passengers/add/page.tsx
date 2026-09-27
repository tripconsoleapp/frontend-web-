import { AppShell } from "@/components/layout/app-shell";
import { AddTraveler } from "@/components/trips/passengers/add-traveler";

export default async function AddTravelerRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <AddTraveler tripId={id} />
    </AppShell>
  );
}
