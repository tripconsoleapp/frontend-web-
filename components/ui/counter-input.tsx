"use client";

import { Minus, Plus } from "lucide-react";
import { motion } from "motion/react";

interface CounterInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function CounterInput({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
}: CounterInputProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-navy/15 px-3.5 py-2.5">
      <span className="font-body text-sm text-navy">{label}</span>
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/20 text-navy transition-colors hover:bg-navy/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={14} />
        </motion.button>
        <span className="w-6 text-center font-body text-sm font-semibold text-navy">
          {value}
        </span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-navy/20 text-navy transition-colors hover:bg-navy/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={14} />
        </motion.button>
      </div>
    </div>
  );
}
