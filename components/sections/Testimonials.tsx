"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { InitialsAvatar } from "@/components/primitives/InitialsAvatar";
import { useReducedMotion } from "@/lib/motion";

const TESTIMONIALS = [
  { id: "01", name: "Resident", quote: "[Quote from a resident, used with written permission]", role: "Resident, [community name]" },
  { id: "02", name: "Owner", quote: "[Quote from an owner, used with written permission]", role: "Owner, [locality]" },
  { id: "03", name: "Secretary", quote: "[Quote from a committee secretary, used with written permission]", role: "Secretary, [community name]" },
];

function TestimonialCard({ testimonial, offset }: { testimonial: (typeof TESTIMONIALS)[number]; offset: number }) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={reducedMotion ? undefined : { y }} className="flex flex-col items-center rounded-lg bg-surface-raised p-8 text-center shadow-sm">
      <InitialsAvatar
        name={testimonial.name}
        size="md"
        ariaLabel={`Initials avatar for ${testimonial.role}`}
      />
      <p className="mt-6 font-serif text-display-sm italic text-text-primary">&ldquo;{testimonial.quote}&rdquo;</p>
      <p className="mt-4 text-body-sm text-text-tertiary">{testimonial.role}</p>
    </motion.div>
  );
}

export function Testimonials() {
  return (
    <Section>
      <Container>
        <Reveal>
          <h2 className="text-center font-serif text-display-md text-text-primary">
            From residents, owners and committees
          </h2>
        </Reveal>

        <Reveal stagger className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} offset={i === 1 ? -12 : 12} />
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
