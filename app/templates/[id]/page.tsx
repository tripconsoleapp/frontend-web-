import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { TemplateDetailView } from "@/components/templates/template-detail-view";
import { getTemplateById } from "@/lib/mock-templates";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = getTemplateById(id);

  if (!template) {
    notFound();
  }

  return (
    <AppShell>
      <TemplateDetailView template={template} />
    </AppShell>
  );
}
