"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Calendar, MapPin, Search, Users } from "lucide-react";

export function HomeHero() {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleScroll() {
      if (!imageRef.current) return;
      const offset = Math.min(window.scrollY * 0.15, 80);
      imageRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative isolate flex min-h-[92vh] items-end overflow-hidden bg-navy">
      <div
        ref={imageRef}
        className="absolute inset-x-0 -top-[10%] h-[120%] will-change-transform"
      >
        <Image
          src="https://images.unsplash.com/photo-1711192702535-eac61a78ecb0?auto=format&fit=crop&w=2400&q=80"
          alt="Misty green tea plantation hills in Kerala"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-16 pt-40 sm:px-8">
        <div>
          <h1 className="max-w-3xl text-[clamp(3rem,6vw,5.5rem)] font-heading font-extrabold leading-[0.95] text-white">
            Plan every trip from one console
          </h1>
          <p className="mt-5 max-w-xl font-body text-lg text-white/85">
            TripConsole brings your itineraries, bookings, and travel notes
            together in a single, clean workspace.
          </p>
        </div>

        <div className="flex flex-col gap-1 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row sm:items-center sm:divide-x sm:divide-navy/10">
          <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
            <MapPin size={18} className="shrink-0 text-navy/50" />
            <div className="flex min-w-0 flex-col">
              <span className="font-body text-xs font-semibold text-navy">
                Destination
              </span>
              <input
                type="text"
                placeholder="Where to?"
                className="w-full bg-transparent font-body text-sm text-navy placeholder:text-text-grey/60 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
            <Calendar size={18} className="shrink-0 text-navy/50" />
            <div className="flex min-w-0 flex-col">
              <span className="font-body text-xs font-semibold text-navy">
                Dates
              </span>
              <input
                type="text"
                placeholder="Add dates"
                className="w-full bg-transparent font-body text-sm text-navy placeholder:text-text-grey/60 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
            <Users size={18} className="shrink-0 text-navy/50" />
            <div className="flex min-w-0 flex-col">
              <span className="font-body text-xs font-semibold text-navy">
                Group Size
              </span>
              <input
                type="text"
                placeholder="Add travelers"
                className="w-full bg-transparent font-body text-sm text-navy placeholder:text-text-grey/60 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl bg-orange px-6 py-3.5 font-body text-sm font-semibold text-white transition-colors hover:bg-orange/90 sm:ml-1"
          >
            <Search size={16} /> Search
          </button>
        </div>
      </div>
    </section>
  );
}
