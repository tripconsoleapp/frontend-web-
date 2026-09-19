"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Fades a section up into place as it scrolls into view. Uses the same
 * duration/easing as the hero's entrance animation so scroll reveals
 * feel like one consistent motion language across the homepage.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { y: 16, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: EASE_OUT,
        delay: prefersReducedMotion ? 0 : delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
