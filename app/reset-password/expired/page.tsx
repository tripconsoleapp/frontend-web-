import Link from "next/link";
import { Link2Off } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { buttonVariants } from "@/components/ui/button";

export default function ResetPasswordExpiredPage() {
  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-text-grey">
          <Link2Off size={26} />
        </span>
        <h1 className="font-heading text-2xl font-semibold text-navy">
          Link expired
        </h1>
        <p className="font-body text-sm text-text-grey">
          For your security, reset links expire after 24 hours. Please
          request a new one.
        </p>
        <Link
          href="/forgot-password"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "w-full",
          })}
        >
          Request New Link
        </Link>
      </div>
    </AuthCard>
  );
}
