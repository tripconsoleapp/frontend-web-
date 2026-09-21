import { AppShell } from "@/components/layout/app-shell";
import { DayEditor } from "@/components/trips/itinerary/day-editor";

export default async function DayEditorRoute({
  params,
  searchParams,
}: {
  params: Promise<{ dayIndex: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { dayIndex } = await params;
  const { template } = await searchParams;

  return (
    <AppShell>
      <DayEditor dayIndex={Number(dayIndex)} template={template} />
    </AppShell>
  );
}
