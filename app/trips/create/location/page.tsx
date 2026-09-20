import { AppShell } from "@/components/layout/app-shell";
import { LocationPicker } from "@/components/trips/location-picker";

export default async function ChooseLocationPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <LocationPicker basePath="/trips/create/destinations" template={template} />
    </AppShell>
  );
}
