import Link from "next/link";
import { PhotoBackdrop } from "@/components/ui/photo-backdrop";
import { Badge } from "@/components/ui/badge";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { buttonVariants } from "@/components/ui/button";

export function HomeHero() {
  return (
    <PhotoBackdrop
      src="https://images.unsplash.com/photo-1711192702535-eac61a78ecb0?auto=format&fit=crop&w=2400&q=80"
      alt="Misty green tea plantation hillside in Kerala"
      className="flex min-h-[85vh] w-full items-end"
      priority
    >
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-6 pb-20 pt-40 text-center sm:px-8">
        <Badge variant="mint">New</Badge>
        <h1 className="font-heading text-4xl font-bold text-white sm:text-6xl">
          Plan every trip from one console
        </h1>
        <p className="max-w-xl font-body text-lg text-white/80">
          TripConsole brings your itineraries, bookings, and travel notes
          together in a single, clean workspace.
        </p>
        <AvatarGroup
          count={3}
          label="Join 5,000+ travelers"
          labelClassName="text-white/80"
        />
        <Link
          href="/signup"
          className={buttonVariants({ variant: "accent", size: "lg" })}
        >
          Get Started
        </Link>
      </div>
    </PhotoBackdrop>
  );
}
