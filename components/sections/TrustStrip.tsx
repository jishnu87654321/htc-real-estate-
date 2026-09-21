"use client";

import { motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { CountUp } from "@/components/primitives/CountUp";
import { Reveal } from "@/components/primitives/Reveal";
import { duration, ease, stagger, useRevealMotion } from "@/lib/motion";

const FIGURES: {
  value: number;
  suffix: string;
  label: string;
  static: boolean;
  format?: (n: number) => string;
}[] = [
  { value: 120, suffix: "+", label: "Communities managed", static: false },
  { value: 38000, suffix: "+", label: "Homes on the platform", static: false },
  { value: 0, suffix: "", label: "Brokerage, ever", static: true },
  { value: 4.6, suffix: "/5", label: "Average resident rating", static: false, format: (n: number) => n.toFixed(1) },
];

function Divider({ index }: { index: number }) {
  const revealProps = useRevealMotion({
    hidden: { scaleY: 0 },
    visible: { scaleY: 1 },
    transition: { duration: duration.base, ease: ease.out, delay: index * stagger.tight },
    viewport: { once: true, amount: 0.6 },
  });

  return <motion.span className="absolute left-0 top-1/2 hidden h-16 w-px -translate-y-1/2 bg-red-400/50 md:block" {...revealProps} />;
}

export function TrustStrip() {
  return (
    <section className="bg-red-600 py-16 text-white md:py-20 shadow-inner">
      <Container>
        <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-y-0">
          {FIGURES.map((figure, i) => (
            <div key={figure.label} className="relative flex flex-col items-center text-center md:px-6">
              {i > 0 && <Divider index={i} />}
              <Reveal direction="none">
                {figure.static ? (
                  <span className="font-serif text-display-md text-white font-bold">{figure.value}</span>
                ) : (
                  <span className="font-serif text-display-md text-white font-bold">
                    <CountUp value={figure.value} suffix={figure.suffix} format={figure.format} />
                  </span>
                )}
              </Reveal>
              <span className="mt-3 text-label uppercase tracking-[0.08em] font-medium text-red-100">{figure.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
