"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { CarFront, Hotel, Ticket, Utensils } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PrimaryStartOption } from "@/components/trips/primary-start-option";
import { SecondaryStartOption } from "@/components/trips/secondary-start-option";

const SECONDARY_OPTIONS = [
  {
    key: "template",
    title: "Use a Template",
    description:
      "Start with a ready-made trip structure and customize it for your group.",
    ctaLabel: "Browse Templates",
    href: "/templates",
    badge: "Popular",
    imageUrl:
      "https://images.unsplash.com/photo-1747801712919-27e9ba27b479?auto=format&fit=crop&w=200&q=80",
    imageAlt: "Wayanad forest trail",
  },
  {
    key: "pilgrimage",
    title: "Plan a Pilgrimage Trip",
    description:
      "Start with a pre-arranged pilgrimage route, timings and coordination.",
    ctaLabel: "Explore Pilgrimages",
    href: "/pilgrimage",
    imageUrl:
      "https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=200&q=80",
    imageAlt: "South Indian temple architecture",
  },
];

export default function NewTripPage() {
  const shouldReduce = useReducedMotion();

  const item: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      };

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.14 } },
  };

  return (
    <AppShell>
      <div className="relative -mx-10 -my-10 min-h-[calc(100vh-2px)] overflow-hidden bg-[#FAF8F4] px-10 py-10 xl:-mx-14 xl:-my-12 xl:px-14 xl:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-mint/10 blur-3xl"
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1fr] lg:gap-12"
        >
          <motion.div variants={item}>
            <PrimaryStartOption
              imageUrl="https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=1200&q=80"
              imageAlt="Misty tea plantations in the Western Ghats"
              coordinate="10.0889° N, 77.0595° E — Munnar"
              title="Start from Scratch"
              description="Full control — build your trip from zero and choose your own destinations, dates and services."
              ctaLabel="Start from Scratch"
              href="/trips/create/loading?reset=1"
            />
          </motion.div>

          <div className="flex flex-col justify-center gap-10 lg:h-[620px]">
            <motion.div variants={item} className="max-w-lg">
              <p className="font-body text-sm font-semibold uppercase tracking-wide text-orange">
                Create your journey
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl">
                Plan your next journey,{" "}
                <span className="font-serif italic text-navy">your way.</span>
              </h1>
              <p className="mt-3 font-body text-base text-text-grey">
                Choose how you&apos;d like to begin — we&apos;ll guide you from there.
              </p>
            </motion.div>

            <motion.div variants={item} className="flex flex-col gap-4">
              {SECONDARY_OPTIONS.map((option) => (
                <SecondaryStartOption
                  key={option.key}
                  title={option.title}
                  description={option.description}
                  ctaLabel={option.ctaLabel}
                  href={option.href}
                  badge={option.badge}
                  visual={
                    <Image
                      src={option.imageUrl}
                      alt={option.imageAlt}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  }
                />
              ))}

              <SecondaryStartOption
                title="Book a Single Service"
                description="Need only a hotel, vehicle, restaurant or activity?"
                ctaLabel="Book Now"
                href="/book/hotel"
                visual={
                  <div className="grid h-full w-full grid-cols-2 gap-0.5 bg-navy/5 p-1.5">
                    <span className="flex items-center justify-center rounded-md bg-white text-navy">
                      <Hotel size={13} />
                    </span>
                    <span className="flex items-center justify-center rounded-md bg-white text-navy">
                      <CarFront size={13} />
                    </span>
                    <span className="flex items-center justify-center rounded-md bg-white text-navy">
                      <Utensils size={13} />
                    </span>
                    <span className="flex items-center justify-center rounded-md bg-white text-navy">
                      <Ticket size={13} />
                    </span>
                  </div>
                }
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
