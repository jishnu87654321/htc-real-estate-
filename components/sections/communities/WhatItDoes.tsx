"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { duration, stagger, useRevealMotion } from "@/lib/motion";

const ROWS = [
  { module: "Maintenance billing", replaces: "A treasurer and a spreadsheet", does: "Unit-wise invoices raised on schedule, GST-ready, with arrears carried forward automatically" },
  { module: "Dues and collections", replaces: "Chasing people in the lift", does: "Payment links, automatic reminders, a live view of who has paid and who has not" },
  { module: "Accounting", replaces: "Year-end panic", does: "Ledgers, vendor payments, bank reconciliation and an audit trail built as you go" },
  { module: "Visitor and gate", replaces: "A paper register at the gate", does: "Guest approvals from the resident's phone, delivery and cab logging, every entry timestamped" },
  { module: "Complaints", replaces: "A WhatsApp group", does: "Raised, categorised, assigned, tracked, closed — with resolution time measured" },
  { module: "Notices and polls", replaces: "A noticeboard nobody reads", does: "Push, SMS and email in one send, with read receipts and a proper vote for decisions" },
  { module: "Facility booking", replaces: "A diary in the manager's office", does: "Clubhouse, courts and the party hall booked from the app, with clashes prevented" },
  { module: "Vendors and staff", replaces: "Loose arrangements", does: "Contracts, attendance, work orders and payments in one ledger" },
  { module: "Documents", replaces: "A cupboard", does: "Bye-laws, AGM minutes, contracts and approvals, searchable" },
];

function Row({ row, index, hovered, onEnter, onLeave }: { row: (typeof ROWS)[number]; index: number; hovered: boolean; onEnter: () => void; onLeave: () => void }) {
  const revealProps = useRevealMotion({
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
    transition: { duration: duration.base, delay: index * stagger.tight },
    viewport: { once: true, amount: 0.5 },
  });

  return (
    <motion.div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[200px_1fr_1.4fr] sm:items-center sm:gap-6"
      {...revealProps}
    >
      <p className="text-title-md font-semibold text-text-primary">{row.module}</p>
      <p className="text-body-sm text-text-tertiary transition-opacity duration-150" style={{ opacity: hovered ? 0.4 : 1 }}>
        {row.replaces}
      </p>
      <p
        className="text-body-md transition-colors duration-150"
        style={{ color: hovered ? "var(--text-primary)" : "var(--text-secondary)" }}
      >
        {row.does}
      </p>
    </motion.div>
  );
}

export function WhatItDoes() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <Section>
      <Container>
        <Reveal>
          <h2 className="font-serif text-display-md text-text-primary">The whole operation, covered</h2>
        </Reveal>
        <div className="mt-10 divide-y divide-border-subtle border-y border-border-subtle">
          {ROWS.map((row, i) => (
            <Row
              key={row.module}
              row={row}
              index={i}
              hovered={hovered === i}
              onEnter={() => setHovered(i)}
              onLeave={() => setHovered(null)}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
