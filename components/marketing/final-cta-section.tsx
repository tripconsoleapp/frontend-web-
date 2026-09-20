import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2000&q=80"
        alt="Traditional houseboat gliding through Kerala's backwaters"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/60 to-navy/40" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center sm:px-8">
        <span className="font-heading text-base font-bold text-white">
          TripConsole
        </span>
        <p className="text-3xl font-heading font-semibold leading-tight text-white sm:text-4xl">
          Institutional trip management,{" "}
          <span className="font-serif italic text-mint">simplified.</span>
        </p>
        <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/signup/create"
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
