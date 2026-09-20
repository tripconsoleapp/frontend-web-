import { AppShell } from "@/components/layout/app-shell";
import { DestinationsFlow } from "@/components/trips/destinations-flow";
import { getTemplateById } from "@/lib/mock-templates";

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; start?: string; startLabel?: string }>;
}) {
  const { template: templateId, start, startLabel } = await searchParams;
  const template = templateId ? getTemplateById(templateId) : undefined;

  return (
    <AppShell>
      <DestinationsFlow
        startId={start}
        startLabel={startLabel}
        templateId={templateId}
        templateName={template?.name}
      />
    </AppShell>
  );
}
