"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, CalendarClock, Compass, LayoutTemplate } from "lucide-react";
import { getTemplateById } from "@/lib/mock-templates";
import { PILGRIMAGE_DEPARTURES } from "@/lib/pilgrimage-departures";

const templateOption = getTemplateById("sabarimala-pilgrimage");
const nextDeparture = PILGRIMAGE_DEPARTURES[0];
const departureTemplate = getTemplateById(nextDeparture.templateId);

export function PilgrimageEntry() {
  const shouldReduce = useReducedMotion();

  const fadeUp: Variants = shouldReduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      };
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: shouldReduce ? 0 : 0.12 } },
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Editorial hero — a real destination photo carries the introduction,
          not a colored panel with an icon. */}
      <div className="relative min-h-[320px] w-full overflow-hidden rounded-3xl sm:min-h-[380px]">
        <Image
          src="https://images.unsplash.com/photo-1644773182204-f0bf03cae0cb?auto=format&fit=crop&w=2000&q=80"
          alt="South Indian temple architecture at dawn"
          fill
          priority
          sizes="(min-width: 1024px) 90vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/35 to-navy/10" />
        <div className="relative flex h-full min-h-[320px] flex-col justify-end p-8 sm:min-h-[380px] sm:p-10">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-mint">
            Pilgrimage Program
          </p>
          <h1 className="mt-3 max-w-xl font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl">
            Begin a journey,{" "}
            <span className="font-serif italic">not a form.</span>
          </h1>
          <p className="mt-4 max-w-md font-body text-base text-white/80">
            Three ways to plan a pilgrimage trip — transport, stay and meals
            all move through TripConsole&apos;s usual, trusted booking flow.
          </p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10"
      >
        {/* Start from Scratch — the primary option, given the most visual
            weight since it's full control end to end. */}
        <motion.div variants={fadeUp}>
          <Link
            href="/trips/create/loading?mode=pilgrimage"
            className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1658051161493-1d311c4c7b4d?auto=format&fit=crop&w=1400&q=80"
              alt="Misty hill route toward the Western Ghats"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/25 to-transparent" />
            <div className="relative z-10 flex flex-col gap-3 p-8">
              <span className="flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                <Compass size={12} /> Full control
              </span>
              <h2 className="font-heading text-3xl font-bold leading-tight text-white">
                Start from Scratch
              </h2>
              <p className="max-w-sm font-body text-base text-white/80">
                Choose your own shrines, dates, transport and services — a
                trip built entirely around your group.
              </p>
              <span className="mt-2 inline-flex w-fit items-center gap-2 font-body text-sm font-semibold text-white">
                Begin planning
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Secondary options — deliberately two different visual
            treatments, not a repeated card pattern. */}
        <div className="flex flex-col gap-6">
          {templateOption && (
            <motion.div variants={fadeUp}>
              <Link
                href="/templates?groupType=pilgrimage"
                className="group flex overflow-hidden rounded-2xl border border-navy/10 bg-white transition-colors duration-200 hover:border-navy/20"
              >
                <div className="relative h-auto w-32 shrink-0 overflow-hidden sm:w-40">
                  <Image
                    src={templateOption.imageUrl}
                    alt={templateOption.name}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-1.5 p-5">
                  <span className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-orange">
                    <LayoutTemplate size={13} /> Use a Template
                  </span>
                  <p className="font-heading text-lg font-semibold text-navy">
                    Ready-made routes, yours to customize
                  </p>
                  <p className="font-body text-sm text-text-grey">
                    Start from {templateOption.name} or another pilgrimage
                    template and adjust it to fit.
                  </p>
                </div>
              </Link>
            </motion.div>
          )}

          {departureTemplate && (
            <motion.div variants={fadeUp}>
              <Link
                href="/pilgrimage/scheduled"
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-navy p-6 text-white"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-mint/10 blur-2xl"
                />
                <span className="relative flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-mint">
                  <CalendarClock size={13} /> Join a Scheduled Trip
                </span>
                <div className="relative flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={departureTemplate.imageUrl}
                      alt={departureTemplate.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-heading text-base font-semibold text-white">
                      {nextDeparture.title}
                    </p>
                    <p className="font-body text-xs text-white/70">
                      Next departure &middot; fixed dates &amp; route
                    </p>
                  </div>
                </div>
                <p className="relative font-body text-sm text-white/70">
                  Already-organized group departures — reserve seats and join,
                  nothing to configure.
                </p>
                <span className="relative inline-flex w-fit items-center gap-2 font-body text-sm font-semibold text-white">
                  View departures
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
