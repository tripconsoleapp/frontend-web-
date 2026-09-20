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
import { buttonVariants } from "@/components/ui/button";

const HEADLINE_WORDS = [
  "Plan",
  "every",
  "trip",
  "from",
  "one",
  "console.",
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

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-24 pt-40 sm:px-8">
        <h1
          aria-label={HEADLINE_WORDS.join(" ")}
          className="max-w-3xl text-[clamp(3rem,6vw,5.5rem)] font-heading font-extrabold leading-[0.95] text-white"
        >
          <motion.span
            aria-hidden="true"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.07, delayChildren: 0.05 }}
            className="inline"
          >
            {HEADLINE_WORDS.map((word, index) => (
              <span
                key={index}
                className="inline-block overflow-hidden pb-1 align-bottom"
              >
                <motion.span
                  variants={wordVariants}
                  className="inline-block"
                >
                  {word}
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
      </div>
    </section>
  );
}
