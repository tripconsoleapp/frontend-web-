export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <nav className="bg-navy px-8 py-5 flex items-center justify-between">
        <span className="font-heading font-semibold text-xl text-white">
          TripConsole
        </span>
        <button className="bg-orange text-white font-body font-medium px-5 py-2 rounded-md hover:opacity-90 transition-opacity">
          Get Started
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <span className="inline-block bg-mint text-navy font-body font-medium text-sm px-3 py-1 rounded-full">
          New
        </span>
        <h1 className="font-heading font-bold text-4xl sm:text-5xl text-navy max-w-2xl">
          Plan every trip from one console
        </h1>
        <p className="font-body text-text-grey max-w-lg text-lg">
          TripConsole brings your itineraries, bookings, and travel notes
          together in a single, clean workspace.
        </p>
        <button className="bg-navy text-white font-body font-medium px-6 py-3 rounded-md hover:opacity-90 transition-opacity">
          Start Planning
        </button>
      </main>
    </div>
  );
}
