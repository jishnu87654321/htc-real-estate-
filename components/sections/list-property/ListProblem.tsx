"use client";

import { motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { duration, stagger, useRevealMotion } from "@/lib/motion";

const ROWS = [
  { pain: "Broker fee", line: "You pay a month's rent to someone who makes three phone calls." },
  { pain: "Fake enquiries", line: "Your number goes on a portal and twelve agents call you before one tenant does." },
  { pain: "Tenant risk", line: "You meet someone for twenty minutes and hand over your flat for eleven months." },
  { pain: "Vacancy", line: "Every empty month is rent you will never get back." },
  { pain: "Distance", line: "You live in another city and the flat needs someone to actually be there." },
];

function ProblemRow({ row, index }: { row: (typeof ROWS)[number]; index: number }) {
  const rowReveal = useRevealMotion({
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
    transition: { duration: duration.slow, delay: index * stagger.loose },
    viewport: { once: true, amount: 0.4 },
  });
  const barReveal = useRevealMotion({
    hidden: { scaleY: 0 },
    visible: { scaleY: 1 },
    transition: { duration: duration.base, delay: index * stagger.loose },
    viewport: { once: true, amount: 0.4 },
  });

  return (
    <motion.div className="relative border-b border-border-subtle py-6 pl-6" {...rowReveal}>
      <motion.span className="absolute left-0 top-6 h-[calc(100%-2rem)] w-0.5 origin-top bg-clay-500" {...barReveal} />
      <p className="text-title-lg font-semibold text-text-primary">{row.pain}</p>
      <p className="mt-1 text-body-md text-text-secondary">{row.line}</p>
    </motion.div>
  );
}

export function ListProblem() {
  return (
    <Section className="bg-surface-sunken">
      <Container className="max-w-3xl">
        <Reveal>
          <h2 className="font-serif text-display-md text-text-primary">Listing a flat is not the hard part</h2>
        </Reveal>

        <div className="mt-10 flex flex-col">
          {ROWS.map((row, i) => (
            <ProblemRow key={row.pain} row={row} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
