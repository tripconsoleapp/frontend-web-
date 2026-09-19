import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="bg-navy px-6 py-5 sm:px-8 flex items-center justify-between">
      <Link
        href="/"
        className="font-heading font-semibold text-xl text-white"
      >
        TripConsole
      </Link>
      <Link href="/signup" className={buttonVariants({ variant: "accent", size: "sm" })}>
        Get Started
      </Link>
    </nav>
  );
}
