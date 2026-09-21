"use client";

import { motion } from "motion/react";
import { Truck, FileCheck2, PaintRoller, Wrench, Building2, Landmark, ArrowRight } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/primitives/Button";
import { duration } from "@/lib/motion";

const SERVICES = [
  { icon: Truck, label: "Packers and movers" },
  { icon: FileCheck2, label: "Rental agreement and registration" },
  { icon: PaintRoller, label: "Painting and deep cleaning" },
  { icon: Wrench, label: "Plumbing and electrical" },
  { icon: Building2, label: "Property management" },
  { icon: Landmark, label: "Home loan assistance" },
];

function ServiceTile({ icon: Icon, label }: (typeof SERVICES)[number]) {
  return (
    <motion.div
      className="flex min-w-[220px] shrink-0 items-center justify-between gap-3 rounded-lg bg-surface-raised p-5 sm:min-w-0 sm:shrink"
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-clay-600" strokeWidth={1.5} />
        <span className="text-body-md font-medium text-text-primary">{label}</span>
      </div>
      <motion.div variants={{ rest: { x: 0 }, hover: { x: 2 } }} transition={{ duration: duration.fast }}>
        <ArrowRight className="h-4 w-4 text-text-tertiary" />
      </motion.div>
    </motion.div>
  );
}

export function Services() {
  return (
    <Section>
      <Container>
        <Reveal>
          <h2 className="font-serif text-display-md text-text-primary">The rest of moving, handled</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-4 text-body-lg text-text-secondary">Booked from the same account, billed to the same place.</p>
        </Reveal>

        <div
          tabIndex={0}
          role="region"
          aria-label="Services carousel"
          className="mt-10 flex gap-4 overflow-x-auto pb-2 sm:hidden [scroll-snap-type:x_mandatory] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          {SERVICES.map((s) => (
            <div key={s.label} className="[scroll-snap-align:start]">
              <ServiceTile {...s} />
            </div>
          ))}
        </div>

        <Reveal stagger className="mt-10 hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3">
          {SERVICES.map((s) => (
            <ServiceTile key={s.label} {...s} />
          ))}
        </Reveal>

        <div className="mt-10">
          <Button href="/pricing" variant="ghost" size="md">
            Explore services
          </Button>
        </div>
      </Container>
    </Section>
  );
}
