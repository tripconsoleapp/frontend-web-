import { Compass, PenLine, Sparkles, Ticket } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StartOptionCard } from "@/components/trips/start-option-card";

const OPTIONS = [
  {
    icon: PenLine,
    title: "Start from Scratch",
    description:
      "Full control, build your trip from zero — choose your own destinations, dates, and services.",
    buttonLabel: "Start from Scratch",
    href: "/trips/create",
  },
  {
    icon: Sparkles,
    title: "Use a Template",
    description:
      "Pre-built trip structures you can customize for your group in minutes.",
    buttonLabel: "Browse Templates",
    href: "/templates",
  },
  {
    icon: Compass,
    title: "Plan a Pilgrimage Trip",
    description:
      "Pre-arranged pilgrimage destinations with routes, timings, and coordination built in.",
    buttonLabel: "Explore Pilgrimages",
    href: "/pilgrimage",
  },
  {
    icon: Ticket,
    title: "Book a Single Service",
    description:
      "Just transport, hotel, or restaurant — no need to create a full trip.",
    buttonLabel: "Book Now",
    href: "/book/hotel",
  },
];

export default function NewTripPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="font-heading text-2xl font-bold text-navy">
          How would you like to start your trip?
        </h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {OPTIONS.map((option) => (
            <StartOptionCard key={option.title} {...option} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
