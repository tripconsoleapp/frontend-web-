"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowRight, Briefcase, GraduationCap, Landmark, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const INTENT_OPTIONS = [
  { label: "Start from scratch", href: "/trips/create/loading" },
  { label: "Use a template", href: "/templates" },
  { label: "See every option", href: "/trips/new" },
];

const AUDIENCE_ICONS = [GraduationCap, Users, Briefcase, Landmark];

const HEADLINE_WORDS = [
  { text: "Plan", emphasis: false },
  { text: "every", emphasis: false },
  { text: "trip", emphasis: false },
  { text: "from", emphasis: false },
  { text: "one", emphasis: true },
  { text: "console.", emphasis: true },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const wordVariants = {
    hidden: prefersReducedMotion
      ? { y: 0, opacity: 1 }
      : { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.55,
        ease: EASE_OUT,
      },
    },
  };

  const fadeUpVariants = {
    hidden: prefersReducedMotion
      ? { y: 0, opacity: 1 }
      : { y: 16, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: EASE_OUT,
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[92vh] items-end overflow-hidden bg-navy"
    >
      <motion.div
        style={prefersReducedMotion ? undefined : { y: parallaxY }}
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
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-20 pt-40 sm:px-8">
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="flex items-center gap-2.5 font-body text-xs font-semibold uppercase tracking-[0.18em] text-white/80"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
          </span>
          Trip planning, reimagined
        </motion.p>
        <h1
          aria-label={HEADLINE_WORDS.map((w) => w.text).join(" ")}
          className="max-w-3xl text-[clamp(3rem,6vw,5.5rem)] font-heading font-extrabold leading-[0.95] text-white"
        >
          <motion.span
            aria-hidden="true"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.07, delayChildren: 0.05 }}
            className="inline"
          >
            {HEADLINE_WORDS.map(({ text, emphasis }, index) => (
              <span
                key={index}
                className="inline-block overflow-hidden pb-1 align-bottom"
              >
                <motion.span
                  variants={wordVariants}
                  className={emphasis ? "font-serif inline-block italic" : "inline-block"}
                >
                  {text}
                  {index < HEADLINE_WORDS.length - 1 ? " " : ""}
                </motion.span>
              </span>
            ))}
          </motion.span>
        </h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.55 }}
          className="max-w-xl font-body text-base text-white/85"
        >
          TripConsole brings your itineraries, bookings, and travel notes
          together in a single, clean workspace.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.7 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            href="/signup"
            className={buttonVariants({ variant: "accent", size: "lg" })}
          >
            Get Started
          </Link>
          <Link
            href="/templates"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "border-white/40 text-white hover:bg-white/10",
            })}
          >
            Browse Templates
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          transition={{ delay: prefersReducedMotion ? 0 : 0.85 }}
          className="flex items-center gap-3 pt-2"
        >
          <div className="flex">
            {AUDIENCE_ICONS.map((Icon, i) => (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-navy bg-mint text-navy first:ml-0 -ml-2"
              >
                <Icon size={12} strokeWidth={2.25} />
              </span>
            ))}
          </div>
          <span className="font-body text-xs text-white/70">For schools, families, corporates &amp; pilgrimages</span>
        </motion.div>
      </div>
    </section>
  );
}

/** A real launcher into the same three entry points /trips/new offers —
 *  styled as a slim intent strip in normal flow directly below the hero,
 *  not a floating stats card. */
export function IntentStrip() {
  return (
    <div className="border-b border-navy/[0.06] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-orange">Start with a plan</p>
          <h3 className="mt-1 font-heading text-lg font-semibold text-navy">Where do you want to begin?</h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {INTENT_OPTIONS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="group inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2.5 font-body text-sm font-medium text-navy transition-colors hover:border-orange hover:bg-orange/5 hover:text-orange"
            >
              {label}
              <ArrowRight size={14} className="text-orange opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
