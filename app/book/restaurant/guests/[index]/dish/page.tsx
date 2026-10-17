import { AppShell } from "@/components/layout/app-shell";
import { GuestDishSelection } from "@/components/book/restaurant/guest-dish-selection";

export default async function BookRestaurantGuestDishRoute({ params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  return (
    <AppShell>
      <GuestDishSelection index={Number(index)} />
    </AppShell>
  );
}
