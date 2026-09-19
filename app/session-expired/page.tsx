import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { buttonVariants } from "@/components/ui/button";

export default function SessionExpiredPage() {
  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/40 text-navy">
          <RefreshCcw size={26} />
        </span>
        <h1 className="font-heading text-2xl font-semibold text-navy">
          Session expired
        </h1>
        <p className="font-body text-sm text-text-grey">
          For your security, you&rsquo;ve been logged out. Please log in
          again to continue.
        </p>
        <Link
          href="/login"
          className={buttonVariants({
            variant: "accent",
            size: "lg",
            className: "w-full",
          })}
        >
          Log In Again
        </Link>
        <Link
          href="/support"
          className="font-body text-sm text-text-grey hover:text-navy"
        >
          Need help? Contact support
        </Link>
      </div>
    </AuthCard>
  );
}
