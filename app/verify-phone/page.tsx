import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { VerifyPhoneFlow } from "@/components/auth/verify-phone-flow";

export default async function VerifyPhonePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; returnTo?: string }>;
}) {
  const { phone, returnTo } = await searchParams;

  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1585640036119-ce2bf9c502d8?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Riverside camp trail in Coorg"
      location="Coorg, Karnataka"
      quote="A quick check now saves a headache later."
      quoteEmphasis="We just need to know it's really you."
    >
      <VerifyPhoneFlow initialPhone={phone} returnTo={returnTo ?? "login"} />
    </AuthSplitLayout>
  );
}
