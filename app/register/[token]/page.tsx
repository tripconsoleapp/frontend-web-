import { RegisterTraveler } from "@/components/trips/passengers/register-traveler";

export default async function RegisterTravelerRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <RegisterTraveler token={token} />;
}
