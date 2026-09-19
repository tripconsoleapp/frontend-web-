import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="bg-navy px-6 py-20 sm:px-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <span className="font-heading text-2xl font-semibold text-white">
          TripConsole
        </span>
        <p className="font-body text-lg text-white/70">
          Institutional trip management, simplified.
        </p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/signup"
            className={buttonVariants({ variant: "accent", size: "lg" })}
          >
            Create an Account
          </Link>
          <Link
            href="/login"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "border-white/30 text-white hover:bg-white/10",
            })}
          >
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}
