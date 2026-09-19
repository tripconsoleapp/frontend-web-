import { AppShell } from "@/components/layout/app-shell";
import { TemplatesView } from "@/components/templates/templates-view";
import { MOCK_TEMPLATES } from "@/lib/mock-templates";

export default function TemplatesPage() {
  return (
    <AppShell>
      <TemplatesView templates={MOCK_TEMPLATES} />
    </AppShell>
  );
}
