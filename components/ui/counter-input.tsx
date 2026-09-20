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
    <div className="flex items-center justify-between rounded-xl bg-navy/[0.03] px-4 py-3">
      <span className="font-body text-base text-navy">{label}</span>
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-navy shadow-sm transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus size={14} />
        </motion.button>
        <span className="w-6 text-center font-body text-base font-semibold text-navy">
          {value}
        </span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-navy shadow-sm transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={14} />
        </motion.button>
      </div>
    </div>
  );
}
