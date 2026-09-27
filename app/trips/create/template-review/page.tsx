import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { TemplateReviewView } from "@/components/trips/template-review-view";
import { getTemplateById } from "@/lib/mock-templates";

export default async function TemplateReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template: templateId } = await searchParams;
  const template = templateId ? getTemplateById(templateId) : undefined;
  if (!template) notFound();

  return (
    <AppShell>
      <TemplateReviewView template={template} />
    </AppShell>
  );
}
