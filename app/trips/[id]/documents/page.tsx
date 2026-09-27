import { AppShell } from "@/components/layout/app-shell";
import { DocumentCenter } from "@/components/trips/documents/document-center";

export default async function DocumentsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell>
      <DocumentCenter tripId={id} />
    </AppShell>
  );
}
