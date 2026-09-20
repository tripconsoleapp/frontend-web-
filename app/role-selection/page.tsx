import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { StepBadge } from "@/components/onboarding/step-badge";
import { RoleSelector } from "@/components/onboarding/role-selector";

export default async function ChooseRolePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Rolling tea estates in Munnar, Kerala"
      location="Munnar, Kerala"
      quote="Every plan starts with knowing who's behind it."
      quoteEmphasis="We shape TripConsole around how you actually work."
    >
      <div className="flex flex-col gap-6">
        <StepBadge step={2} total={3} label="Choose Your Role" />

        <div>
          <h1 className="text-[2.5rem] font-heading font-semibold leading-[1.02] text-navy">
            Choose your role
          </h1>
          <p className="mt-2 font-body text-base text-text-grey">
            Select how you&rsquo;ll be using TripConsole. This cannot be
            changed later without contacting support.
          </p>
        </div>

        <RoleSelector email={email ?? ""} />
      </div>
    </AuthSplitLayout>
  );
}
