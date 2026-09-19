"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

interface TripTypeCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export function TripTypeCard({
  icon,
  title,
  description,
  selected,
  onSelect,
}: TripTypeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex flex-col items-start gap-3 rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-colors",
        selected
          ? "border-mint bg-mint/10 shadow-md"
          : "border-navy/10 hover:border-navy/25"
      )}
    >
      {selected && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-mint text-white">
          <Check size={13} strokeWidth={3} />
        </span>
      )}
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy">
        {icon}
      </span>
      <div>
        <h3 className="font-heading font-semibold text-navy">{title}</h3>
        <p className="mt-1 font-body text-sm text-text-grey">{description}</p>
      </div>
    </motion.button>
  );
}
