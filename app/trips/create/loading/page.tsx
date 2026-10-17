import { TripSetupLoader } from "@/components/trips/trip-setup-loader";
import { getTemplateById } from "@/lib/mock-templates";

export default async function TripSetupLoadingPage({
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

  const nextParams = new URLSearchParams();
  if (templateId) nextParams.set("template", templateId);
  if (participants) nextParams.set("participants", participants);
  if (mode) nextParams.set("mode", mode);
  if (entry) nextParams.set("entry", entry);
  if (reset) nextParams.set("reset", reset);
  const query = nextParams.toString();

  return (
    <TripSetupLoader
      templateName={template?.name}
      nextHref={`/trips/create/basics${query ? `?${query}` : ""}`}
    />
  );
}
