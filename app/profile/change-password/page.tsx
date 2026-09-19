import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

export default function ChangePasswordPage() {
  return (
    <AppShell
      header={
        <AppHeader title="Change Password" leftIcon="back" backHref="/profile" />
      }
    >
      <ChangePasswordForm />
    </AppShell>
  );
}
