import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { buttonVariants } from "@/components/ui/button";

export default function SessionExpiredPage() {
  return (
    <AuthSplitLayout
      imageUrl="https://images.unsplash.com/photo-1704365159747-1f7b8913044f?auto=format&fit=crop&w=1400&q=80"
      imageAlt="Traditional houseboat on Alleppey's backwaters"
      location="Alleppey, Kerala"
      quote="Good things are worth logging back in for."
      quoteEmphasis="We kept your seat warm."
    >
      <div className="flex flex-col gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/40 text-navy">
          <RefreshCcw size={20} />
        </span>
        <h1 className="text-[2.5rem] font-heading font-semibold leading-[1.02] text-navy">
          Session expired
        </h1>
        <p className="font-body text-base text-text-grey">
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
          className="font-body text-base text-text-grey hover:text-navy"
        >
          Need help? Contact support
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
