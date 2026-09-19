import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { ProfileView } from "@/components/profile/profile-view";

export default function ProfilePage() {
  return (
    <AppShell header={<AppHeader title="Profile" />}>
      <ProfileView />
    </AppShell>
  );
}
