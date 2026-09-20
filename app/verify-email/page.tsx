import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1704365159747-1f7b8913044f?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Traditional houseboat on Alleppey's backwaters"
      location="Alleppey, Kerala"
      quote="A good trip starts the moment someone says yes."
      quoteEmphasis="We just make sure it's really you."
    >
      <VerifyEmailForm email={email ?? "you@school.edu"} />
    </AuthSplitLayout>
  );
}
