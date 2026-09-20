import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1711192702535-eac61a78ecb0?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Misty green tea plantation hills in Kerala"
      location="Munnar, Kerala"
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}
