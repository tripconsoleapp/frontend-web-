import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1747801712919-27e9ba27b479?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Misty forest trail in Wayanad, Kerala"
      location="Wayanad, Kerala"
      quote="Locked out happens to the best planners."
      quoteEmphasis="Let's get you back to it."
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}
