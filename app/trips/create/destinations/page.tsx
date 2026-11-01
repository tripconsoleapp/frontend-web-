import { AppShell } from "@/components/layout/app-shell";
import { DestinationsFlow } from "@/components/trips/destinations-flow";
import { getTemplateById } from "@/lib/mock-templates";

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    template?: string;
    start?: string;
    startLabel?: string;
    startDistrict?: string;
    startLat?: string;
    startLng?: string;
  }>;
}) {
  const { template: templateId, start, startLabel, startDistrict, startLat, startLng } = await searchParams;
  const template = templateId ? getTemplateById(templateId) : undefined;

  return (
    <AppShell>
      <DestinationsFlow
        startId={start}
        startLabel={startLabel}
        startDistrict={startDistrict}
        startLat={startLat ? Number(startLat) : undefined}
        startLng={startLng ? Number(startLng) : undefined}
        templateId={templateId}
        templateName={template?.name}
      />
    </AppShell>
  );
}
