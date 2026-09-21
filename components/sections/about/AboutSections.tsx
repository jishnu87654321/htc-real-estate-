"use client";

import { motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Placeholder } from "@/components/primitives/Placeholder";
import { Button } from "@/components/primitives/Button";
import { InitialsAvatar } from "@/components/primitives/InitialsAvatar";
import { duration, stagger, useRevealMotion } from "@/lib/motion";

export function AboutIntro() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <Reveal>
          <p className="text-body-lg text-text-secondary">
            HTC began managing residential communities in 2018. Somewhere around the 30th community, a pattern
            became obvious: we always knew which flats were about to be free, who the good tenants were, and what a
            home in that building actually cost to live in each month — weeks before any of it reached a property
            portal. That gap between what we knew and what the market could see is the entire reason this platform
            exists.
          </p>
        </Reveal>

        <Reveal className="mt-10">
          <h2 className="text-title-lg font-semibold text-text-primary">What we do</h2>
          <p className="mt-3 text-body-md text-text-secondary">
            We manage residential communities end to end — maintenance, billing, security and staff — and we list the
            homes inside them. The two sides run on the same platform, so information moves between them instead of
            staying locked in one office.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}

export function AboutMoney() {
  return (
    <Section className="bg-surface-sunken">
      <Container className="max-w-3xl">
        <Reveal>
          <h2 className="font-serif text-display-md text-text-primary">How we make money</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-4 max-w-[60ch] text-body-lg text-text-secondary">
            Three sources, and nothing else: owner plans for owners who want tenant screening or full property
            management, community subscriptions paid by the societies we run, and services residents choose to book
            through the platform. We do not charge seekers, and we do not charge brokerage on any transaction.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}

export function AboutCommunitiesCareers() {
  return (
    <Section>
      <Container className="grid grid-cols-1 gap-16 md:grid-cols-2">
        <Reveal>
          <h2 className="text-title-lg font-semibold text-text-primary">Communities we manage</h2>
          <p className="mt-3 text-body-md text-text-secondary">
            120 communities across Hyderabad and Bengaluru. Full list available on request from the committee
            or facility manager of your building.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="text-title-lg font-semibold text-text-primary">Careers</h2>
          <p className="mt-3 text-body-md text-text-secondary">
            We hire for both sides of the business — property operations and product. Open roles are listed with the
            team and location attached, not a generic careers page.
          </p>
          <div className="mt-4">
            <Button href="/contact" variant="ghost" size="md">
              See open roles
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

const TEAM_MEMBERS = [
  { name: "Operations Lead", role: "Property Operations", initials: "OL" },
  { name: "Facility Director", role: "On-Site Management", initials: "FD" },
  { name: "Platform Architect", role: "Engineering & Systems", initials: "PA" },
  { name: "Community Liaison", role: "Resident Relations", initials: "CL" },
];

function TeamCard({ member, index }: { member: (typeof TEAM_MEMBERS)[number]; index: number }) {
  const revealProps = useRevealMotion({
    hidden: { opacity: 0, rotate: 2, y: 16 },
    visible: { opacity: 1, rotate: 0, y: 0 },
    transition: { duration: duration.slow, delay: index * stagger.base },
  });

  return (
    <motion.div {...revealProps} className="flex flex-col items-center text-center p-6 rounded-lg bg-surface-raised border border-border-subtle shadow-sm">
      <InitialsAvatar
        name={member.name}
        size="xl"
        className="mb-4"
        ariaLabel={`Team member initials: ${member.name}`}
      />
      <p className="mt-2 text-title-md font-semibold text-text-primary">{member.name}</p>
      <p className="text-body-sm text-text-tertiary">{member.role}</p>
    </motion.div>
  );
}

export function AboutTeam() {
  return (
    <Section className="bg-surface-sunken">
      <Container>
        <Reveal>
          <h2 className="font-serif text-display-md text-text-primary text-center sm:text-left">The team</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
