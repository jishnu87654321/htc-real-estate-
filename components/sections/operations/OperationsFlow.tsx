"use client";

import { motion } from "motion/react";
import { ease, useReducedMotion, useRevealMotion } from "@/lib/motion";

const NODES = {
  resident: { x: 60, y: 60, label: "Resident" },
  helpdesk: { x: 240, y: 60, label: "Helpdesk" },
  supervisor: { x: 420, y: 60, label: "Supervisor" },
  technician: { x: 420, y: 220, label: "Technician / Vendor" },
  guard: { x: 60, y: 220, label: "Guard" },
  committee: { x: 240, y: 220, label: "Committee" },
};

const EDGES = [
  { id: "complaint", from: "resident", to: "helpdesk", label: "complaint / request" },
  { id: "workorder", from: "helpdesk", to: "supervisor", label: "work order" },
  { id: "assigned", from: "supervisor", to: "technician", label: "assigned job" },
  { id: "closure", from: "technician", to: "helpdesk", label: "photo + closure", curve: true },
  { id: "status", from: "helpdesk", to: "resident", label: "status + time", curve: true },
  { id: "incident", from: "guard", to: "supervisor", label: "incident / handover" },
  { id: "report", from: "guard", to: "committee", label: "daily report" },
  { id: "approvals", from: "committee", to: "helpdesk", label: "approvals / notices" },
];

const LOOP = ["complaint", "workorder", "assigned", "closure", "status"];

function pathFor(edge: (typeof EDGES)[number]) {
  const a = NODES[edge.from as keyof typeof NODES];
  const b = NODES[edge.to as keyof typeof NODES];
  if (!edge.curve) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  const midX = (a.x + b.x) / 2 + 30;
  const midY = (a.y + b.y) / 2 + 30;
  return `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
}

function FlowEdge({ edge, index }: { edge: (typeof EDGES)[number]; index: number }) {
  const revealProps = useRevealMotion({
    hidden: { pathLength: 0 },
    visible: { pathLength: 1 },
    transition: { duration: 0.6, ease: ease.inOut, delay: index * 0.15 },
    viewport: { once: true, amount: 0.3 },
  });

  return <motion.path d={pathFor(edge)} fill="none" stroke="var(--paper-300)" strokeWidth="2" {...revealProps} />;
}

function FlowNode({ node, index }: { node: (typeof NODES)[keyof typeof NODES]; index: number }) {
  const revealProps = useRevealMotion({
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    transition: { ...ease.spring, delay: index * 0.06 },
    viewport: { once: true, amount: 0.4 },
  });

  return (
    <motion.g {...revealProps} style={{ transformOrigin: `${node.x}px ${node.y}px` }}>
      <circle cx={node.x} cy={node.y} r="22" fill="var(--white)" stroke="var(--ink-900)" strokeWidth="2" />
      <text x={node.x} y={node.y + 38} textAnchor="middle" fontSize="12" fill="var(--ink-700)" fontWeight="500" fontFamily="var(--font-sans)">
        {node.label}
      </text>
    </motion.g>
  );
}

export function OperationsFlow() {
  const reducedMotion = useReducedMotion();

  return (
    <svg viewBox="0 0 480 280" className="w-full" role="img" aria-label="Diagram: a resident complaint travels from helpdesk to supervisor to technician and back, timestamped at every step; guard incidents and committee approvals feed the same helpdesk">
      {EDGES.map((edge, i) => (
        <FlowEdge key={edge.id} edge={edge} index={i} />
      ))}

      {!reducedMotion && (
        <motion.circle
          r="5"
          fill="var(--red-600)"
          animate={{
            offsetDistance: ["0%", "0%", "100%", "100%"],
          }}
          transition={{
            duration: LOOP.length * (1.2 + 0.3),
            times: [0, 0.02, 0.5, 1],
            repeat: Infinity,
            repeatDelay: 2,
            delay: EDGES.length * 0.15 + 0.6,
            ease: "linear",
          }}
          style={{ offsetPath: `path('${LOOP.map((id) => pathFor(EDGES.find((e) => e.id === id)!)).join(" ")}')` }}
        />
      )}

      {Object.entries(NODES).map(([key, node], i) => (
        <FlowNode key={key} node={node} index={i} />
      ))}
    </svg>
  );
}
