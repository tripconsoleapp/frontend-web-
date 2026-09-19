import { AuthCard } from "@/components/auth/auth-card";
import { VerifyPhoneFlow } from "@/components/auth/verify-phone-flow";

export default async function VerifyPhonePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; returnTo?: string }>;
}) {
  const { phone, returnTo } = await searchParams;

  return (
    <AuthCard>
      <VerifyPhoneFlow initialPhone={phone} returnTo={returnTo ?? "login"} />
    </AuthCard>
  );
}
