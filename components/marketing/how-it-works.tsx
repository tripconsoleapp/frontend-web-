const STEPS = [
  {
    number: "01",
    label: "Plan",
    description: "Map out itineraries, stops, and budgets in minutes.",
  },
  {
    number: "02",
    label: "Book",
    description: "Reserve transport, stays, meals, and activities without leaving the console.",
  },
  {
    number: "03",
    label: "Track",
    description: "Follow costs, passengers, and approvals in real time, together.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-orange">Process</p>
          <h2 className="mt-2 text-[clamp(1.8rem,3.1vw,2.8rem)] font-heading font-bold leading-[1.02] text-navy">
            How it works
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
          {STEPS.map(({ number, label, description }) => (
            <div key={label} className="relative border-t-2 border-navy/10 pt-6">
              <span className="absolute -top-px left-0 h-0.5 w-10 bg-orange" aria-hidden="true" />
              <span className="font-heading text-sm font-semibold text-text-grey">{number}</span>
              <h3 className="mt-3 font-heading text-xl font-bold text-navy">{label}</h3>
              <p className="mt-2 max-w-xs font-body text-base text-text-grey">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
