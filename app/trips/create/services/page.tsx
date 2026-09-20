import { AppShell } from "@/components/layout/app-shell";
import { ServicesForm } from "@/components/trips/services-form";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;

  return (
    <AppShell>
      <ServicesForm template={template} />
    </AppShell>
  );
}
