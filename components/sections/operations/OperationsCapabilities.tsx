"use client";

import { useState } from "react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { CountUp } from "@/components/primitives/CountUp";

const CAPABILITIES = [
  { title: "Work orders", body: "Every complaint becomes a job with an owner, a due time and a status." },
  { title: "Shift handover", body: "Guards log incidents and open items at the end of every shift, on record." },
  { title: "Staff attendance", body: "Check-in and check-out logged per shift, with rosters kept current." },
  { title: "Vendor coordination", body: "Every vendor job has a deadline, a named person and a completion photo." },
  { title: "Escalation matrix", body: "Unresolved items move up automatically, so nothing sits unowned." },
  { title: "Announcements", body: "One notice reaches residents, staff or both, with delivery confirmed." },
  { title: "Committee workspace", body: "Decisions, approvals and spends kept in a form the next committee can read." },
  { title: "Incident log", body: "Every security or safety incident recorded with time, location and outcome." },
];

const ROLES = [
  { role: "Resident", sees: "Their own unit, their dues, their complaints, community notices", cannotSee: "Other residents' financial records" },
  { role: "Committee member", sees: "All community finances, decisions and reports", cannotSee: "Individual residents' personal documents" },
  { role: "Facility manager", sees: "Every work order, the vendors, the staff roster", cannotSee: "Resident payment methods" },
  { role: "Supervisor", sees: "Jobs assigned to their team, their team's attendance", cannotSee: "Community financials" },
  { role: "Guard", sees: "Gate log, visitor approvals, the shift handover", cannotSee: "Everything else" },
  { role: "Vendor", sees: "Only the jobs assigned to them", cannotSee: "Anything about the community beyond those jobs" },
];

export function OperationsCapabilities() {
  const [hoveredRole, setHoveredRole] = useState<number | null>(null);

  return (
    <>
      <Section className="bg-surface-sunken">
        <Container>
          <Reveal>
            <h2 className="font-serif text-display-md text-text-primary">What the console does</h2>
          </Reveal>
          <Reveal stagger className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="rounded-lg border border-border-subtle bg-surface-raised p-6">
                <h3 className="text-title-lg font-semibold text-text-primary">{c.title}</h3>
                <p className="mt-2 text-body-sm text-text-secondary">{c.body}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <h2 className="font-serif text-display-md text-text-primary">Who sees what</h2>
          </Reveal>
          <div
            tabIndex={0}
            role="region"
            aria-label="Role permissions table"
            className="mt-10 overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="py-3 text-title-md font-semibold text-text-primary">Role</th>
                  <th className="py-3 text-title-md font-semibold text-text-primary">Sees</th>
                  <th className="py-3 text-title-md font-semibold text-text-primary">Cannot see</th>
                </tr>
              </thead>
              <tbody>
                {ROLES.map((r, i) => (
                  <tr
                    key={r.role}
                    onMouseEnter={() => setHoveredRole(i)}
                    onMouseLeave={() => setHoveredRole(null)}
                    className="border-b border-border-subtle transition-opacity duration-150"
                    style={{ opacity: hoveredRole === null || hoveredRole === i ? 1 : 0.5 }}
                  >
                    <td className="py-4 pr-4 text-body-md font-semibold text-text-primary">{r.role}</td>
                    <td className="py-4 pr-4 text-body-sm text-text-secondary">{r.sees}</td>
                    <td className="py-4 text-body-sm text-text-tertiary">{r.cannotSee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Reveal>
            <h2 className="mt-16 font-serif text-display-sm text-text-primary">Because someone will ask what happened</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <Stat value={18} suffix=" hrs" label="Average resolution" />
            <Stat value={94} suffix="%" label="Closed within SLA" />
            <Stat value={100} suffix="%" label="Of actions logged" />
          </div>
        </Container>
      </Section>
    </>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-display-md text-red-600 font-bold">
        <CountUp value={value} suffix={suffix} />
      </p>
      <p className="mt-1 text-body-sm text-text-tertiary">{label}</p>
    </div>
  );
}
