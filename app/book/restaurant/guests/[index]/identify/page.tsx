import { AppShell } from "@/components/layout/app-shell";
import { GuestIdentification } from "@/components/book/restaurant/guest-identification";

export default async function BookRestaurantGuestIdentifyRoute({ params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  return (
    <AppShell>
      <GuestIdentification index={Number(index)} />
    </AppShell>
  );
}
