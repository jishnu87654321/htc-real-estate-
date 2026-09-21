"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Placeholder } from "@/components/primitives/Placeholder";
import { Reveal } from "@/components/primitives/Reveal";
import { duration, ease, useReducedMotion, useRevealMotion } from "@/lib/motion";

const BULLETS = [
  "Listing is free, and stays free",
  "Tenant screening from real platform history, not a self-declared form",
  "Rent collection, agreement and maintenance handled if you want it",
  "One point of contact for the property, not three",
];

function CheckMark() {
  const revealProps = useRevealMotion({
    hidden: { pathLength: 0 },
    visible: { pathLength: 1 },
    transition: { duration: duration.base, ease: ease.out },
    viewport: { once: true, amount: 0.8 },
  });

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-red-600" fill="none">
      <motion.path d="M4 12.5L9.5 18L20 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...revealProps} />
    </svg>
  );
}

export function ForOwners() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  return (
    <section className="bg-red-50/40 py-[clamp(5rem,10vw,10rem)] text-text-primary border-y border-red-100/60">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <Badge variant="red">
              For owners and landlords
            </Badge>
            <h2 className="mt-6 font-serif text-display-md text-text-primary">Your tenant is probably already in one of our communities.</h2>
            <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">
              List free, and your home goes in front of 38,000 residents who already live in buildings we manage —
              people whose identity, rental history and maintenance record are on the platform. Most of our listings
              are tenanted without ever being advertised publicly.
            </p>

            <Reveal stagger className="mt-8 flex flex-col gap-4">
              {BULLETS.map((bullet) => (
                <div key={bullet} className="flex items-start gap-3">
                  <CheckMark />
                  <span className="text-body-md text-text-primary font-medium">{bullet}</span>
                </div>
              ))}
            </Reveal>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/list-your-property" variant="primary" size="lg">
                List your property free
              </Button>
              <Button href="/pricing" variant="ghost" size="lg">
                See owner plans
              </Button>
            </div>
          </div>

          <div ref={containerRef} className="lg:col-span-6 flex justify-center">
            <motion.div style={reducedMotion ? undefined : { y }} className="w-full max-w-md rounded-xl border border-border-subtle bg-surface-raised p-2 shadow-lg">
              <Placeholder
                id="home-owners-01"
                ratio="1/1"
                label="Owner handing over keys, or a hand with keys, warm light, close crop"
                className="h-full w-full rounded-lg"
              />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
