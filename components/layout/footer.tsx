import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-white px-6 py-8 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <span className="font-heading font-semibold text-navy">
          TripConsole
        </span>
        <p className="font-body text-sm text-text-grey">
          &copy; {new Date().getFullYear()} TripConsole. All rights reserved.
        </p>
        <div className="flex items-center gap-5 font-body text-sm text-text-grey">
          <Link href="/privacy" className="hover:text-navy">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-navy">
            Terms
          </Link>
          <Link href="/login" className="hover:text-navy">
            Log In
          </Link>
        </div>
      </div>
    </footer>
  );
}
