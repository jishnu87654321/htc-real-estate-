"use client";

import { motion } from "motion/react";
import { CountUp } from "@/components/primitives/CountUp";
import { duration, useReducedMotion } from "@/lib/motion";

const LINES = [
  { label: "Rent", value: 42000 },
  { label: "Maintenance", value: 3200 },
  { label: "Estimated utilities", value: 2500 },
];

const TOTAL = LINES.reduce((sum, l) => sum + l.value, 0);

export function CostCalculator() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-6 shadow-sm">
      <h2 className="text-title-lg font-semibold text-text-primary">What this actually costs you each month</h2>
      <div className="mt-5 flex flex-col gap-2">
        {LINES.map((line) => (
          <div key={line.label} className="flex items-baseline justify-between py-1">
            <span className="text-body-md text-text-secondary">{line.label}</span>
            <span className="font-sans text-title-lg font-semibold tabular-nums text-text-primary">
              ₹<CountUp value={line.value} />
            </span>
          </div>
        ))}
      </div>
      <motion.div
        className="mt-4 flex items-baseline justify-between rounded-lg bg-red-50 p-3.5 border border-red-100"
        initial={reducedMotion ? false : { opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.base }}
      >
        <span className="text-title-md font-semibold text-red-900">Total Monthly Outflow</span>
        <span className="font-sans text-price font-bold tabular-nums text-red-700">
          ₹<CountUp value={TOTAL} />
        </span>
      </motion.div>
      <div className="mt-6 border-t border-border-subtle pt-4 text-body-sm text-text-secondary">
        One-time: deposit ₹1,26,000 + agreement and registration ₹6,000
      </div>
    </div>
  );
}
