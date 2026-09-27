import Link from "next/link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Start a trip", href: "/trips/new" },
      { label: "Templates", href: "/templates" },
      { label: "How it works", href: "/#how-it-works" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Sign up", href: "/signup" },
      { label: "My Trips", href: "/dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy px-6 pt-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-10 pb-12 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <span className="font-heading text-lg font-bold text-white">TripConsole</span>
            <p className="max-w-[22ch] font-body text-sm text-white/60">
              One workspace for planning, booking, and running group trips.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-white/40">{column.title}</p>
              <div className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <Link key={link.href} href={link.href} className="font-body text-sm text-white/75 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-white/10 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="font-body text-sm text-white/50">&copy; {new Date().getFullYear()} TripConsole. All rights reserved.</p>
          <p className="font-body text-sm text-white/50">Made for schools, families, corporates &amp; pilgrim groups.</p>
        </div>
      </div>
    </footer>
  );
}
