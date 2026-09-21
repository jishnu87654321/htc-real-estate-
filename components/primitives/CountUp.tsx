"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { duration, useReducedMotion } from "@/lib/motion";

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  className?: string;
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString("en-IN");

/**
 * Animates a number from 0 to target over duration.scene, once on enter.
 * Reduced motion: renders the final value immediately.
 */
export function CountUp({ value, prefix = "", suffix = "", format = defaultFormat, className }: CountUpProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration.scene * 1000, bounce: 0 });
  const display = useTransform(springValue, (v) => `${prefix}${format(v)}${suffix}`);

  if (reducedMotion) {
    return (
      <span ref={ref} className={className}>
        {prefix}
        {format(value)}
        {suffix}
      </span>
    );
  }

  if (inView) {
    motionValue.set(value);
  }

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
