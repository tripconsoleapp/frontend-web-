import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="bg-white px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <Badge variant="mint">New</Badge>
        <h1 className="font-heading text-4xl font-bold text-navy sm:text-6xl">
          Plan every trip from one console
        </h1>
        <p className="max-w-xl font-body text-lg text-text-grey">
          TripConsole brings your itineraries, bookings, and travel notes
          together in a single, clean workspace.
        </p>
        <Link
          href="/signup"
          className={buttonVariants({ variant: "accent", size: "lg" })}
        >
          Get Started
        </Link>
        <p className="font-body text-sm text-text-grey">
          Join 5,000+ travelers — no credit card required
        </p>
      </div>
    </section>
  );
}
