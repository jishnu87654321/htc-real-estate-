"use client";

import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { duration, stagger, useRevealMotion } from "@/lib/motion";

const FACTS_COLS = 5;

const KEY_FACTS = [
  { label: "Built-up area", value: "1,450 sq ft" },
  { label: "Floor", value: "6 of 12" },
  { label: "Facing", value: "East" },
  { label: "Furnishing", value: "Semi-furnished" },
  { label: "Available from", value: "1 October 2026" },
  { label: "Preferred tenants", value: "Family, Company lease" },
  { label: "Age of property", value: "4 years" },
  { label: "Parking", value: "1 covered" },
  { label: "Balconies", value: "2" },
  { label: "Bathrooms", value: "2" },
];

export function PropertyHeadline() {
  return (
    <div>
      <h1 className="font-serif text-display-lg text-text-primary">3 BHK for rent in Sarvani Heights, Gachibowli</h1>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <span className="font-sans text-price font-bold tabular-nums text-text-primary">
          ₹42,000 <span className="text-body-md font-normal text-text-secondary">/month</span>
        </span>
        <span className="text-body-md tabular-nums text-text-secondary">₹1,26,000 deposit</span>
        <span className="text-body-md tabular-nums text-text-secondary">₹3,200 maintenance</span>
      </div>
    </div>
  );
}

export function VerificationCard() {
  const revealProps = useRevealMotion({
    hidden: { pathLength: 0 },
    visible: { pathLength: 1 },
    transition: { duration: duration.scene },
    viewport: { once: true, amount: 0.6 },
  });

  return (
    <div className="relative rounded-xl border border-green-200 bg-green-100/70 p-6 shadow-sm">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <motion.rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="12"
          fill="none"
          stroke="var(--green-600)"
          strokeWidth="1.5"
          {...revealProps}
        />
      </svg>
      <div className="relative flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-green-700" />
        <div>
          <p className="text-title-md font-semibold text-green-800">Verified on 12 September 2026</p>
          <p className="mt-2 text-body-md text-ink-700">
            Confirmed by Ramesh K., Facility Manager at Sarvani Heights. He checked the home exists, is vacant
            from 1 October, and matches these photos.
          </p>
          <Link href="#how-we-verify" className="mt-2 inline-block text-body-sm font-semibold text-green-700 hover:text-green-800 underline-offset-2 hover:underline">
            How we verify →
          </Link>
        </div>
      </div>
    </div>
  );
}

function FactItem({ fact, index }: { fact: (typeof KEY_FACTS)[number]; index: number }) {
  const row = Math.floor(index / FACTS_COLS);
  const col = index % FACTS_COLS;
  const revealProps = useRevealMotion({
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
    transition: { duration: duration.slow, delay: (row + col) * stagger.tight },
    viewport: { once: true, amount: 0.4 },
  });

  return (
    <motion.div {...revealProps}>
      <p className="text-body-sm text-text-tertiary">{fact.label}</p>
      <p className="mt-1 text-title-md font-semibold text-text-primary">{fact.value}</p>
    </motion.div>
  );
}

export function KeyFacts() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-5 rounded-xl border border-border-subtle bg-white p-6 shadow-sm">
      {KEY_FACTS.map((fact, i) => (
        <FactItem key={fact.label} fact={fact} index={i} />
      ))}
    </div>
  );
}
