import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Rolling tea estates in Munnar, Kerala"
      location="Munnar, Kerala"
      quote="A fresh password, a fresh start."
      quoteEmphasis="Let's make it a good one."
    >
      <ResetPasswordForm />
    </AuthSplitLayout>
  );
}
