import { CalendarCheck } from "lucide-react";
import { StepBadge } from "@/components/onboarding/step-badge";
import { RoleSelector } from "@/components/onboarding/role-selector";

export default async function ChooseRolePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white px-6 py-16">
      <StepBadge step={2} total={3} label="Choose Your Role" />

      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
          <CalendarCheck size={28} />
        </span>
        <h1 className="font-heading text-3xl font-semibold text-navy">
          Choose your role
        </h1>
        <p className="max-w-md font-body text-text-grey">
          Select how you&rsquo;ll be using TripConsole. This cannot be
          changed later without contacting support.
        </p>
      </div>

      <RoleSelector email={email ?? ""} />
    </div>
  );
}
