import { AppShell } from "@/components/layout/app-shell";
import { MenuSelection } from "@/components/trips/meals/menu-selection";

export default async function MenuSelectionRoute({
  params,
  searchParams,
}: {
  params: Promise<{ mealKey: string }>;
  searchParams: Promise<{ template?: string }>;
}) {
  const { mealKey } = await params;
  const { template } = await searchParams;

  return (
    <AppShell>
      <MenuSelection mealKey={mealKey} template={template} />
    </AppShell>
  );
}
