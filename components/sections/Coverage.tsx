"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/primitives/Button";
import { ease, stagger, useReducedMotion, useRevealMotion } from "@/lib/motion";

const CITIES = [
  { id: "hyderabad", label: "Hyderabad", count: "84 communities", x: 220, y: 200 },
  { id: "bengaluru", label: "Bengaluru", count: "36 communities", x: 260, y: 340 },
];

function CityDot({ city, index }: { city: (typeof CITIES)[number]; index: number }) {
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const dotRevealProps = useRevealMotion({
    hidden: { scale: 0 },
    visible: { scale: 1 },
    transition: { ...ease.spring, delay: index * stagger.tight },
    viewport: { once: true },
  });

  return (
    <g
      transform={`translate(${city.x}, ${city.y})`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer"
    >
      {!reducedMotion && (
        <motion.circle
          cx={0}
          cy={0}
          r="6"
          fill="none"
          stroke="var(--red-600)"
          strokeWidth="1.5"
          initial={{ scale: 0.6, opacity: 0.6 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 2, ease: ease.out, delay: index * 0.3 + 0.6, repeat: Infinity, repeatDelay: 1.5 }}
        />
      )}
      <motion.circle cx={0} cy={0} r="6" fill="var(--red-600)" {...dotRevealProps} />
      {hovered && (
        <foreignObject x={-70} y={-48} width={140} height={40}>
          <div className="rounded-md bg-ink-900 px-3 py-1.5 text-center text-body-sm text-white shadow-md">
            {city.count}
          </div>
        </foreignObject>
      )}
      <text x="0" y="26" textAnchor="middle" fontSize="14" fill="var(--text-secondary)" fontFamily="var(--font-sans)">
        {city.label}
      </text>
    </g>
  );
}

export function Coverage() {
  return (
    <Section className="bg-surface-sunken">
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <h2 className="font-serif text-display-md text-text-primary">Where HTC is right now</h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-4 text-body-lg text-text-secondary">
              120 communities across Hyderabad and Bengaluru, with a third city opening shortly.
            </p>
          </Reveal>
          <div className="mt-8">
            <Button href="/contact" variant="ghost" size="md">
              Is your community on HTC?
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <svg viewBox="0 0 480 420" className="w-full" role="img" aria-label="Map showing HTC coverage in Hyderabad and Bengaluru">
            <path
              d="M120 40 C 60 90, 40 180, 90 260 C 60 320, 100 380, 180 400 C 260 410, 340 380, 360 320 C 420 280, 420 180, 360 120 C 320 60, 200 20, 120 40 Z"
              fill="var(--paper-100)"
              stroke="var(--border-strong)"
              strokeWidth="1.5"
            />
            {CITIES.map((city, i) => (
              <CityDot key={city.id} city={city} index={i} />
            ))}
          </svg>
        </div>
      </Container>
    </Section>
  );
}
