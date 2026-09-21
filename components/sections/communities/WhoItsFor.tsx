"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Tabs } from "@/components/ui/Tabs";
import { duration } from "@/lib/motion";

const TABS = [
  {
    id: "residents",
    label: "Residents",
    title: "Your building, on your phone",
    body: "Approve visitors before they reach the gate, pay maintenance without a reminder, raise a complaint and watch it actually move, book the clubhouse, read notices that are not buried in a group chat.",
  },
  {
    id: "committee",
    label: "Committee",
    title: "Your term, on record",
    body: "Every rupee, every decision and every approval logged in a form the next committee can read. No handover folder, no missing receipts, no arguments at the AGM about what was agreed.",
  },
  {
    id: "facility",
    label: "Facility team",
    title: "Your day, organised",
    body: "Complaints become assigned jobs with owners and due times. Shift handovers are logged. Vendor work has a deadline and a photo on completion.",
  },
];

export function WhoItsFor() {
  const [active, setActive] = useState("residents");
  const activeTab = TABS.find((t) => t.id === active)!;

  return (
    <Section className="bg-surface-sunken">
      <Container>
        <Tabs tabs={TABS} active={active} onChange={setActive} layoutId="communities-audience-tab" />
        <div className="relative mt-8 min-h-[140px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base }}
            >
              <h2 className="font-serif text-display-md text-text-primary">{activeTab.title}</h2>
              <p className="mt-4 max-w-[60ch] text-body-lg text-text-secondary">{activeTab.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </Section>
  );
}
