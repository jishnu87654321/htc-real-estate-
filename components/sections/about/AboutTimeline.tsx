"use client";

import { motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { ease, useRevealMotion } from "@/lib/motion";

const MILESTONES = [
  { year: "[Year]", body: "HTC starts managing its first residential communities in Hyderabad." },
  { year: "[Year]", body: "Community count passes [30]. The pattern behind the listings platform becomes obvious." },
  { year: "[Year]", body: "The listings platform launches, built on top of the communities we already run." },
  { year: "[Year]", body: "Operations console ships for committees, facility teams and guards." },
  { year: "[Year]", body: "HTC expands to Bengaluru, with [city] next." },
];

function TimelineSpine() {
  const revealProps = useRevealMotion({
    hidden: { pathLength: 0 },
    visible: { pathLength: 1 },
    transition: { duration: 1.4, ease: ease.inOut },
    viewport: { once: true, amount: 0.1 },
  });

  return (
    <svg className="absolute left-0 top-0 h-full w-2" aria-hidden>
      <motion.line x1="1" y1="0" x2="1" y2="100%" stroke="var(--border-strong)" strokeWidth="2" {...revealProps} />
    </svg>
  );
}

function MilestoneDot({ index }: { index: number }) {
  const revealProps = useRevealMotion({
    hidden: { scale: 0 },
    visible: { scale: 1 },
    transition: { ...ease.spring, delay: index * 0.15 },
    viewport: { once: true, amount: 0.6 },
  });

  return (
    <motion.span
      className="absolute -left-8 top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-red-600 ring-4 ring-red-100"
      {...revealProps}
    />
  );
}

export function AboutTimeline() {
  return (
    <Section className="bg-surface-sunken">
      <Container className="max-w-2xl">
        <Reveal>
          <h2 className="font-serif text-display-md text-text-primary">How we got here</h2>
        </Reveal>

        <div className="relative mt-12 pl-8">
          <TimelineSpine />
          <div className="flex flex-col gap-10">
            {MILESTONES.map((m, i) => (
              <div key={i} className="relative">
                <MilestoneDot index={i} />
                <p className="text-title-md font-semibold text-red-600">{m.year}</p>
                <p className="mt-1 text-body-md text-text-secondary">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
