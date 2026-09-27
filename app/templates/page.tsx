import { AppShell } from "@/components/layout/app-shell";
import { TemplatesView } from "@/components/templates/templates-view";
import { GroupType, MOCK_TEMPLATES } from "@/lib/mock-templates";

const VALID_GROUP_TYPES: GroupType[] = [
  "school",
  "college",
  "family",
  "corporate",
  "pilgrimage",
  "individual",
];

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ groupType?: string }>;
}) {
  const { groupType } = await searchParams;
  const initialGroupTypes = VALID_GROUP_TYPES.filter((type) => type === groupType);

  return (
    <AppShell>
      <TemplatesView templates={MOCK_TEMPLATES} initialGroupTypes={initialGroupTypes} />
    </AppShell>
  );
}
