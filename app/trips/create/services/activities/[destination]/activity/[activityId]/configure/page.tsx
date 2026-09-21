import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ActivityConfigure } from "@/components/trips/activities/activity-configure";
import { getActivity } from "@/lib/mock-activity-catalog";

export default async function ActivityConfigureRoute({
  params,
  searchParams,
}: {
  params: Promise<{ destination: string; activityId: string }>;
  searchParams: Promise<{ template?: string; edit?: string }>;
}) {
  const { destination, activityId } = await params;
  const { template } = await searchParams;
  const activity = getActivity(activityId);

  if (!activity) {
    const backHref = `/trips/create/services/activities/${destination}/discover${template ? `?template=${template}` : ""}`;
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-navy/[0.02] px-6 py-16 text-center">
          <p className="font-heading text-base font-semibold text-navy">We couldn&rsquo;t load this activity.</p>
          <Link href={backHref} className="font-body text-sm font-semibold text-orange underline underline-offset-2">
            Back to results
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ActivityConfigure destinationId={destination} activity={activity} template={template} />
    </AppShell>
  );
}
