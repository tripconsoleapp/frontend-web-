import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

export default function ChangePasswordPage() {
  return (
    <AppShell>
      <div className="flex max-w-xl flex-col gap-6">
        <Link
          href="/profile"
          className="inline-flex w-fit items-center gap-2 font-body text-sm font-medium text-navy hover:underline"
        >
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Change Password
        </h1>
        <ChangePasswordForm />
      </div>
    </AppShell>
  );
}
