import { AppShell } from "@/components/layout/app-shell";
import { TripBasicsForm } from "@/components/trips/trip-basics-form";
import { getTemplateById } from "@/lib/mock-templates";

export default async function TripBasicsPage({
  searchParams,
}: {
  searchParams: Promise<{
    template?: string;
    participants?: string;
    mode?: string;
    entry?: string;
    reset?: string;
  }>;
}) {
  const { template: templateId, participants, mode, entry, reset } = await searchParams;
  const template = templateId ? getTemplateById(templateId) : undefined;

  return (
    <AppShell>
      <TripBasicsForm
        template={template}
        participants={participants}
        initialMode={mode === "pilgrimage" ? "pilgrimage" : undefined}
        initialEntry={entry === "scheduled" ? "scheduled" : undefined}
        resetDraft={reset === "1"}
      />
    </AppShell>
  );
}
