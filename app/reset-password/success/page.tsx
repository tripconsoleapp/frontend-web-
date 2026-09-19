import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { buttonVariants } from "@/components/ui/button";

export default function ResetPasswordSuccessPage() {
  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/40 text-navy">
          <CheckCircle2 size={28} />
        </span>
        <h1 className="font-heading text-2xl font-semibold text-navy">
          Password updated!
        </h1>
        <p className="font-body text-sm text-text-grey">
          Your security is our priority. You can now log in with your new
          credentials.
        </p>
        <Link
          href="/login"
          className={buttonVariants({
            variant: "accent",
            size: "lg",
            className: "w-full",
          })}
        >
          Go to Login
        </Link>
      </div>
    </AuthCard>
  );
}
