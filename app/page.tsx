import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { ValuePropSection } from "@/components/marketing/value-prop-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <Badge variant="mint">New</Badge>
        <h1 className="font-heading font-bold text-4xl sm:text-5xl text-navy max-w-2xl">
          Plan every trip from one console
        </h1>
        <p className="font-body text-text-grey max-w-lg text-lg">
          TripConsole brings your itineraries, bookings, and travel notes
          together in a single, clean workspace.
        </p>
        <Link href="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>
          Start Planning
        </Link>
      </main>

      <ValuePropSection
        eyebrow="Final step"
        eyebrowVariant="orange"
        title="Book Your Journey"
        description="Experience lightning-fast planning with our secure console. Your next great adventure is just a tap away."
        imagePosition="right"
      >
        <AvatarGroup count={3} label="Join 50k+ travelers" />
      </ValuePropSection>

      <ValuePropSection
        eyebrow="Seamless planning"
        title="Plan Your Escape"
        description="Discover and organize your next adventure with our seamless trip planning tools designed for the discerning traveler."
        imagePosition="left"
      />

      <FinalCtaSection />
    </div>
  );
}
