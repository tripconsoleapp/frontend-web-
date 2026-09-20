import Link from "next/link";
import { Link2Off } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { buttonVariants } from "@/components/ui/button";

export default function ResetPasswordExpiredPage() {
  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Rolling tea estates in Munnar, Kerala"
      location="Munnar, Kerala"
      quote="Even the best plans need a second look sometimes."
      quoteEmphasis="Let's get you a fresh link."
    >
      <div className="flex flex-col gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/5 text-text-grey">
          <Link2Off size={20} />
        </span>
        <h1 className="text-[2.5rem] font-heading font-semibold leading-[1.02] text-navy">
          Link expired
        </h1>
        <p className="font-body text-base text-text-grey">
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
    </AuthSplitLayout>
  );
}
