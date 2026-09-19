import { Bell } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard";
import { ActiveDashboard } from "@/components/dashboard/active-dashboard";
import { MOCK_TRIPS } from "@/lib/mock-trips";
import { MOCK_USER } from "@/lib/mock-user";

async function getTrips(forceEmpty: boolean) {
  // Placeholder for a real trips API call.
  return forceEmpty ? [] : MOCK_TRIPS;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ empty?: string }>;
}) {
  const { empty } = await searchParams;
  const trips = await getTrips(empty === "1");
  const firstName = MOCK_USER.fullName.split(" ")[0];

  return (
    <AppShell
      header={
        <AppHeader
          title="TripConsole"
          rightHref="/notifications"
          rightIcon={<Bell size={20} />}
        />
      }
    >
      {trips.length === 0 ? (
        <EmptyDashboard name={firstName} />
      ) : (
        <ActiveDashboard name={firstName} trips={trips} />
      )}
    </AppShell>
  );
}
