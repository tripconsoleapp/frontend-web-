import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin } from "lucide-react";

interface AuthSplitLayoutProps {
  children: ReactNode;
  imageUrl?: string;
  imageAlt?: string;
  location?: string;
  quote?: string;
  quoteEmphasis?: string;
  quoteAuthor?: string;
  quoteRole?: string;
}

export function AuthSplitLayout({
  children,
  imageUrl = "https://images.unsplash.com/photo-1747801712919-27e9ba27b479?auto=format&fit=crop&w=1400&q=80",
  imageAlt = "Misty forest trail in Wayanad, Kerala",
  location = "Wayanad, Kerala",
  quote = "TripConsole cut our trip-planning overhead in half.",
  quoteEmphasis = "It's the first tool our whole team actually enjoys using.",
  quoteAuthor = "Meera Nair",
  quoteRole = "Head of Operations, Wanderlink",
}: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-navy/10" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-12">
          <Link
            href="/"
            className="font-heading text-xl font-bold text-white"
          >
            TripConsole
          </Link>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-12">
          <blockquote className="max-w-md">
            <p className="font-heading text-2xl font-medium leading-snug text-white">
              &ldquo;{quote}{" "}
              <span className="font-serif italic text-mint">
                {quoteEmphasis}
              </span>
              &rdquo;
            </p>
            <footer className="mt-4 font-body text-sm text-white/70">
              {quoteAuthor}, {quoteRole}
            </footer>
          </blockquote>
          <span className="mt-6 flex items-center gap-2 font-body text-sm text-white/65">
            <MapPin size={14} /> {location}
          </span>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 font-body text-sm text-text-grey transition-colors hover:text-navy"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
