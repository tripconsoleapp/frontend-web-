import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { buttonVariants } from "@/components/ui/button";

export default function ResetPasswordSuccessPage() {
  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Rolling tea estates in Munnar, Kerala"
      location="Munnar, Kerala"
      quote="A fresh password, a fresh start."
      quoteEmphasis="Let's make it a good one."
    >
      <div className="flex flex-col gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/40 text-navy">
          <CheckCircle2 size={22} />
        </span>
        <h1 className="text-[2.5rem] font-heading font-semibold leading-[1.02] text-navy">
          Password updated!
        </h1>
        <p className="font-body text-base text-text-grey">
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
    </AuthSplitLayout>
  );
}
