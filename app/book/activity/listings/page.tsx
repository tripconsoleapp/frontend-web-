import { AppShell } from "@/components/layout/app-shell";
import { ActivityListings } from "@/components/book/activity/activity-listings";

export default function BookActivityListingsRoute() {
  return (
    <AppShell>
      <ActivityListings />
    </AppShell>
  );
}
