"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface TripSetupLoaderProps {
  templateName?: string;
  nextHref: string;
}

const STEP_DELAY_MS = 380;

export function TripSetupLoader({
  templateName,
  nextHref,
}: TripSetupLoaderProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const steps = templateName
    ? [
        "Preparing your workspace",
        "Loading trip essentials",
        "Profiling destinations from template",
        "Setting up cost tracking",
        "Finalizing your console",
      ]
    : [
        "Preparing your workspace",
        "Loading trip essentials",
        "Setting up cost tracking",
        "Finalizing your console",
      ];

  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (completedCount >= steps.length) {
      const timeout = setTimeout(
        () => router.push(nextHref),
        prefersReducedMotion ? 100 : 400
      );
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(
      () => setCompletedCount((count) => count + 1),
      prefersReducedMotion ? 60 : STEP_DELAY_MS
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCount]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mint/40 text-navy">
          <Sparkles size={26} />
        </span>
        <h1 className="font-heading text-2xl font-semibold text-navy">
          Setting up your trip...
        </h1>
      </div>

      {templateName && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className="flex items-center gap-2 rounded-xl border border-mint/60 bg-mint/15 px-5 py-3"
        >
          <span className="font-body text-sm text-navy">
            Using: <span className="font-semibold">{templateName}</span>
          </span>
        </motion.div>
      )}

      <ul className="flex w-full max-w-sm flex-col gap-3">
        {steps.map((step, index) => {
          const isDone = index < completedCount;
          const isActive = index === completedCount;

          return (
            <motion.li
              key={step}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{
                opacity: isDone || isActive ? 1 : 0.35,
                y: 0,
              }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              className="flex items-center gap-3 rounded-lg border border-navy/10 bg-white px-4 py-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-navy/15">
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.span
                      key="done"
                      initial={
                        prefersReducedMotion
                          ? false
                          : { scale: 0, opacity: 0 }
                      }
                      animate={{ scale: 1, opacity: 1 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 400, damping: 20 }
                      }
                      className="flex h-full w-full items-center justify-center rounded-full bg-mint text-navy"
                    >
                      <Check size={13} strokeWidth={3} />
                    </motion.span>
                  ) : isActive ? (
                    <motion.span
                      key="active"
                      className="h-2.5 w-2.5 rounded-full bg-orange"
                      animate={
                        prefersReducedMotion ? {} : { scale: [1, 1.3, 1] }
                      }
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  ) : null}
                </AnimatePresence>
              </span>
              <span className="font-body text-sm text-navy">{step}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
