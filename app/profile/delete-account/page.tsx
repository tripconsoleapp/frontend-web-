import { AppShell } from "@/components/layout/app-shell";
import { DeleteAccountForm } from "@/components/profile/delete-account-form";

export default function DeleteAccountPage() {
  return (
    <AppShell>
      <div className="max-w-xl">
        <DeleteAccountForm />
      </div>
    </AppShell>
  );
}
