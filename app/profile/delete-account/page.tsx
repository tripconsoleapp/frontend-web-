import { AppShell } from "@/components/layout/app-shell";
import { AppHeader } from "@/components/layout/app-header";
import { DeleteAccountForm } from "@/components/profile/delete-account-form";

export default function DeleteAccountPage() {
  return (
    <AppShell
      header={
        <AppHeader title="Delete Account" leftIcon="back" backHref="/profile" />
      }
    >
      <DeleteAccountForm />
    </AppShell>
  );
}
