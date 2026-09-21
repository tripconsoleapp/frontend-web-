import { GuestMealPage } from "@/components/trips/meals/guest-meal-page";

export default async function GuestMealRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <GuestMealPage token={token} />;
}
