import { AppShell } from "@/components/layout/app-shell";
import { TripBasicsForm } from "@/components/trips/trip-basics-form";
import { getTemplateById } from "@/lib/mock-templates";

export default async function CreateTripPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; participants?: string }>;
}) {
  const { template: templateId, participants } = await searchParams;
  const template = templateId ? getTemplateById(templateId) : undefined;

  return (
    <AppShell>
      <TripBasicsForm template={template} participants={participants} />
    </AppShell>
  );
}
