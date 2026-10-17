import { AppShell } from "@/components/layout/app-shell";
import { MenuPreview } from "@/components/book/restaurant/menu-preview";

export default async function BookRestaurantMenuRoute({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  return (
    <AppShell>
      <MenuPreview restaurantId={restaurantId} />
    </AppShell>
  );
}
