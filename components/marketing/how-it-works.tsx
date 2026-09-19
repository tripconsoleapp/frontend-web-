import { Activity, Compass, Ticket } from "lucide-react";

const STEPS = [
  {
    icon: Compass,
    label: "Plan",
    description: "Map out itineraries, stops, and budgets in minutes.",
  },
  {
    icon: Ticket,
    label: "Book",
    description: "Reserve tickets and stays without leaving the console.",
  },
  {
    icon: Activity,
    label: "Track",
    description: "Follow costs and updates in real time, together.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white px-6 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-heading text-3xl font-semibold text-navy">
          How it works
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, label, description }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10 text-navy">
                <Icon size={22} />
              </span>
              <h3 className="font-heading font-semibold text-navy">
                {label}
              </h3>
              <p className="font-body text-sm text-text-grey">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
