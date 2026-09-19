import { ReactNode } from "react";
import Link from "next/link";
import { PhotoPanel } from "@/components/ui/photo-panel";

interface AuthSplitLayoutProps {
  children: ReactNode;
  quote?: string;
  quoteAuthor?: string;
  quoteRole?: string;
}

export function AuthSplitLayout({
  children,
  quote = "TripConsole cut our trip-planning overhead in half. It's the first tool our whole team actually enjoys using.",
  quoteAuthor = "Meera Nair",
  quoteRole = "Head of Operations, Wanderlink",
}: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <PhotoPanel className="h-full w-full rounded-none">
          <div className="flex h-full flex-col justify-between p-12">
            <Link
              href="/"
              className="font-heading text-2xl font-semibold text-white"
            >
              TripConsole
            </Link>
            <blockquote className="max-w-md">
              <p className="font-heading text-2xl font-medium leading-snug text-white">
                &ldquo;{quote}&rdquo;
              </p>
              <footer className="mt-4 font-body text-white/70">
                {quoteAuthor}, {quoteRole}
              </footer>
            </blockquote>
          </div>
        </PhotoPanel>
      </div>

      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
