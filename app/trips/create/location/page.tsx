import { AppShell } from "@/components/layout/app-shell";
import { LocationPicker } from "@/components/trips/location-picker";

export default async function ChooseLocationPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const nextParams = new URLSearchParams();
  if (template) nextParams.set("template", template);
  const query = nextParams.toString();

  return (
    <AppShell>
      <LocationPicker
        nextHref={`/trips/create/destinations${query ? `?${query}` : ""}`}
      />
    </AppShell>
  );
}
