import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-navy px-6 py-5 sm:px-8 flex items-center justify-between">
      <Link
        href="/"
        className="font-heading font-bold text-base text-white"
      >
        TripConsole
      </Link>
      <Link
        href="/login"
        className="font-body text-base font-medium text-white hover:text-white/80"
      >
        Log In
      </Link>
    </nav>
  );
}
