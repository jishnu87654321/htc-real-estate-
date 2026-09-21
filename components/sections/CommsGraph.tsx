"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  ShieldCheck,
  ClipboardList,
  Wrench,
  Landmark,
  Pause,
  Play,
  Check,
  MessageSquareWarning,
  UserCheck,
  FileText,
} from "lucide-react";
import { useReducedMotion } from "@/lib/motion";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type RoleId = "manager" | "guards" | "residents" | "vendors" | "committee";

export interface RoleConfig {
  id: RoleId;
  label: string;
  sublabel: string;
  icon: typeof Home;
  access: string;
  angleDeg: number; // Ellipse position angle in degrees (§B3)
}

export const ROLES: Record<RoleId, RoleConfig> = {
  manager: {
    id: "manager",
    label: "Manager",
    sublabel: "Assigns and tracks",
    icon: ClipboardList,
    access: "Assigns work orders, tracks vendor deadlines, logs daily shift tasks and unit status.",
    angleDeg: -90, // Top
  },
  guards: {
    id: "guards",
    label: "Guards",
    sublabel: "Gate log, handovers",
    icon: ShieldCheck,
    access: "Sees gate log, visitor approvals, shift handover. Cannot see anything else.",
    angleDeg: -18, // Upper right
  },
  residents: {
    id: "residents",
    label: "Residents",
    sublabel: "Raise, pay, approve",
    icon: Home,
    access: "Raises complaints, approves visitor entries, pays maintenance dues and views invoices.",
    angleDeg: 54, // Lower right
  },
  vendors: {
    id: "vendors",
    label: "Vendors",
    sublabel: "Assigned jobs only",
    icon: Wrench,
    access: "Receives job dispatches, uploads completion photos and updates repair milestone statuses.",
    angleDeg: 126, // Lower left
  },
  committee: {
    id: "committee",
    label: "Committee",
    sublabel: "Approves and audits",
    icon: Landmark,
    access: "Approves expenditures, reviews audit trails, inspects maintenance reserves and AGM records.",
    angleDeg: 198, // Upper left
  },
};

export interface FlowStep {
  from: RoleId | "console";
  to: RoleId | "console";
  tag: string;
  icon: typeof MessageSquareWarning;
  closes?: boolean;
}

export interface Scenario {
  id: string;
  title: string;
  caption: string;
  steps: FlowStep[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "scenario-a",
    title: "Complaint",
    caption: "A complaint, from raised to fixed",
    steps: [
      { from: "residents", to: "console", tag: "Complaint", icon: MessageSquareWarning },
      { from: "console", to: "manager", tag: "Assigned", icon: FileText },
      { from: "manager", to: "vendors", tag: "Job", icon: Wrench },
      { from: "vendors", to: "console", tag: "Fixed", icon: Wrench },
      { from: "console", to: "residents", tag: "Closed", icon: Check, closes: true },
    ],
  },
  {
    id: "scenario-b",
    title: "Gate entry",
    caption: "A visitor, approved at the gate",
    steps: [
      { from: "guards", to: "console", tag: "Visitor", icon: UserCheck },
      { from: "console", to: "residents", tag: "Approve?", icon: UserCheck },
      { from: "residents", to: "console", tag: "Approved", icon: Check },
      { from: "console", to: "guards", tag: "Closed", icon: Check, closes: true },
    ],
  },
  {
    id: "scenario-c",
    title: "Committee approval",
    caption: "A repair, approved by the committee",
    steps: [
      { from: "manager", to: "console", tag: "Quote", icon: FileText },
      { from: "console", to: "committee", tag: "Approval", icon: FileText },
      { from: "committee", to: "console", tag: "Approved", icon: Check },
      { from: "console", to: "vendors", tag: "Work order", icon: Check, closes: true },
    ],
  },
];

interface EdgePath {
  roleId: RoleId;
  d: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  ctrl: { x: number; y: number };
}

export function CommsGraph() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const hubRef = useRef<HTMLDivElement | null>(null);
  const roleRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [panelDimensions, setPanelDimensions] = useState({ width: 900, height: 560 });
  const [edges, setEdges] = useState<Record<RoleId, EdgePath>>({} as Record<RoleId, EdgePath>);
  const [nodePositions, setNodePositions] = useState<Record<RoleId, { x: number; y: number }>>({} as Record<RoleId, { x: number; y: number }>);

  // Scenario engine state
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [tokenProgress, setTokenProgress] = useState<number>(0);
  const [phase, setPhase] = useState<"inFlight" | "arrived" | "idle">("idle");
  const [resolvedRole, setResolvedRole] = useState<RoleId | null>(null);

  // Interactive state
  const [hoveredRole, setHoveredRole] = useState<RoleId | null>(null);
  const [isManualPaused, setIsManualPaused] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(true);
  const reducedMotion = useReducedMotion();

  const currentScenario = SCENARIOS[scenarioIdx];
  const currentStep = currentScenario.steps[stepIdx];
  const isPlaying = !reducedMotion && !isManualPaused && isInView && !hoveredRole;

  // Measure and compute ellipse node positions & curved quadratic Bézier edges (§B3)
  const computeGeometry = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const width = panel.clientWidth || 900;
    const height = panel.clientHeight || 560;
    setPanelDimensions({ width, height });

    const cx = width / 2;
    const cy = height / 2;
    const rx = width * 0.38;
    const ry = height * 0.36;

    const newPositions: Partial<Record<RoleId, { x: number; y: number }>> = {};
    const newEdges: Partial<Record<RoleId, EdgePath>> = {};

    (Object.keys(ROLES) as RoleId[]).forEach((roleId) => {
      const config = ROLES[roleId];
      const rad = (config.angleDeg * Math.PI) / 180;
      const nx = cx + rx * Math.cos(rad);
      const ny = cy + ry * Math.sin(rad);
      newPositions[roleId] = { x: nx, y: ny };

      // Card boundary intersection math
      const dx = cx - nx;
      const dy = cy - ny;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      const cardHalfW = 75;
      const cardHalfH = 35;
      const hubHalf = 80;

      const startX = nx + Math.cos(angle) * cardHalfW;
      const startY = ny + Math.sin(angle) * cardHalfH;
      const endX = cx - Math.cos(angle) * hubHalf;
      const endY = cy - Math.sin(angle) * hubHalf;

      // Quadratic Bézier with 12% perpendicular arc offset (§B3)
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const perpOffset = dist * 0.12;
      const ctrlX = midX - Math.sin(angle) * perpOffset;
      const ctrlY = midY + Math.cos(angle) * perpOffset;

      const d = `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;

      newEdges[roleId] = {
        roleId,
        d,
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
        ctrl: { x: ctrlX, y: ctrlY },
      };
    });

    setNodePositions(newPositions as Record<RoleId, { x: number; y: number }>);
    setEdges(newEdges as Record<RoleId, EdgePath>);
  }, []);

  useIsomorphicLayoutEffect(() => {
    computeGeometry();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && panelRef.current) {
      ro = new ResizeObserver(() => computeGeometry());
      ro.observe(panelRef.current);
    }

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(computeGeometry).catch(() => {});
    }

    window.addEventListener("resize", computeGeometry);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", computeGeometry);
    };
  }, [computeGeometry]);

  // Visibility threshold observer (>= 30% visible)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.25);
      },
      { threshold: [0, 0.25, 0.5, 1] }
    );
    observer.observe(el);

    const handleVisibility = () => {
      if (document.hidden) {
        setIsInView(false);
      } else {
        const rect = el.getBoundingClientRect();
        setIsInView(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Continuous animation loop driving token motion & scenario transitions
  useEffect(() => {
    if (!isPlaying) return;

    const stepTravelDuration = 1300; // 1.3s travel time (§B5)
    const isLastStep = stepIdx === currentScenario.steps.length - 1;
    const pauseDuration = isLastStep ? 2500 : 1200; // 2.5s between scenarios, 1.2s between steps

    setPhase("inFlight");
    let startTime = performance.now();
    let animId: number;

    const stepLoop = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(Math.max(elapsed / stepTravelDuration, 0), 1);
      setTokenProgress(progress);

      if (progress < 1) {
        animId = requestAnimationFrame(stepLoop);
      } else {
        setPhase("arrived");
        if (currentStep.closes && currentStep.to !== "console") {
          setResolvedRole(currentStep.to as RoleId);
        }
      }
    };

    animId = requestAnimationFrame(stepLoop);

    const fadeTimer = setTimeout(() => {
      setPhase("idle");
    }, stepTravelDuration + 700);

    const nextStepTimer = setTimeout(() => {
      setResolvedRole(null);
      if (isLastStep) {
        setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length);
        setStepIdx(0);
      } else {
        setStepIdx((prev) => prev + 1);
      }
    }, stepTravelDuration + pauseDuration);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(fadeTimer);
      clearTimeout(nextStepTimer);
    };
  }, [isPlaying, scenarioIdx, stepIdx, currentScenario, currentStep]);

  // Compute live coordinates and rotation of travelling token pill along active quadratic curve
  const activeRoleId = (currentStep.from === "console" ? currentStep.to : currentStep.from) as RoleId;
  const activeEdgePath = edges[activeRoleId];

  let tokenPos = { x: panelDimensions.width / 2, y: panelDimensions.height / 2, angle: 0 };
  if (activeEdgePath && phase === "inFlight") {
    const isFromHub = currentStep.from === "console";
    const t = isFromHub ? tokenProgress : 1 - tokenProgress;

    const p0 = activeEdgePath.start;
    const p1 = activeEdgePath.ctrl;
    const p2 = activeEdgePath.end;

    // Quadratic Bézier Point: B(t) = (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
    const tx = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const ty = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

    // Derivative for Tangent: B'(t) = 2(1-t)(P1 - P0) + 2t(P2 - P1)
    const dx = 2 * (1 - t) * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
    const dy = 2 * (1 - t) * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
    const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

    // Follow curve tangent by up to +-8 deg (§B5)
    const clampedAngle = Math.max(-8, Math.min(8, isFromHub ? rawAngle : -rawAngle));

    tokenPos = { x: tx, y: ty, angle: clampedAngle };
  }

  const TokenIcon = currentStep.icon || MessageSquareWarning;
  const isFinalToken = Boolean(currentStep.closes);

  return (
    <div
      ref={containerRef}
      data-comms-graph
      className="relative w-full rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-md md:p-8 overflow-hidden isolate select-none"
    >
      {/* Screen Reader Visually Hidden Context */}
      <div className="sr-only">
        <h3>Example: how a complaint moves through the building.</h3>
        <ol>
          <li>Resident raises complaint regarding lift</li>
          <li>HTC Console assigns to facility manager</li>
          <li>Manager dispatches job to lift technician</li>
          <li>Technician marks fixed with photo verification</li>
          <li>HTC Console marks closed and notifies resident</li>
        </ol>
      </div>

      {/* Header with Live Status & WCAG 2.2.2 Pause Button */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            {!reducedMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
          </span>
          <span className="font-sans text-body-sm font-semibold text-text-primary">
            Live · <span className="text-text-secondary font-normal">Sarvani Heights</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-sans text-label uppercase tracking-widest text-text-tertiary">
            Illustrative
          </span>
          <button
            type="button"
            aria-label={isManualPaused ? "Play animation" : "Pause animation"}
            onClick={() => setIsManualPaused((p) => !p)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface-raised text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            {isManualPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Diagram Panel (Desktop Ellipse Layout: 768px+) */}
      <div
        ref={panelRef}
        className="hidden sm:block relative w-full h-[clamp(520px,56vw,720px)] mt-4"
      >
        {/* SVG Canvas for Track Lines, Orbit Ring, and Dynamic Growing Trails */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full pointer-events-none"
          width={panelDimensions.width || 900}
          height={panelDimensions.height || 560}
        >
          {/* Central Hub Orbit Ring & Orbiting Dots (§B4) */}
          <circle
            cx={(panelDimensions.width || 900) / 2}
            cy={(panelDimensions.height || 560) / 2}
            r={108}
            fill="none"
            stroke="var(--red-200)"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="opacity-70"
          />

          {!reducedMotion && (
            <motion.g
              style={{
                transformOrigin: `${(panelDimensions.width || 900) / 2}px ${(panelDimensions.height || 560) / 2}px`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            >
              <circle
                cx={(panelDimensions.width || 900) / 2 + 108}
                cy={(panelDimensions.height || 560) / 2}
                r={3.5}
                fill="var(--red-400)"
              />
              <circle
                cx={(panelDimensions.width || 900) / 2 - 108}
                cy={(panelDimensions.height || 560) / 2}
                r={3.5}
                fill="var(--red-400)"
              />
            </motion.g>
          )}

          {/* 5 Edge Tracks and Active Synced Trails (§B5) */}
          {(Object.keys(edges) as RoleId[]).map((roleId) => {
            const edge = edges[roleId];
            if (!edge) return null;

            const isCurrentActive = activeRoleId === roleId && (phase === "inFlight" || phase === "arrived");
            const isDimmed = hoveredRole !== null && hoveredRole !== roleId;

            return (
              <g key={roleId}>
                {/* Base Grey Track */}
                <path
                  d={edge.d}
                  fill="none"
                  stroke="var(--paper-300)"
                  strokeWidth="1.5"
                  opacity={isDimmed ? 0.35 : 1}
                  className="transition-opacity duration-300"
                />

                {/* Growing Red Trail Synced to Token Movement (§B5) */}
                {isCurrentActive && !reducedMotion && (
                  <motion.path
                    d={edge.d}
                    fill="none"
                    stroke={isFinalToken ? "var(--green-600)" : "var(--red-600)"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{
                      pathLength: currentStep.from === "console" ? tokenProgress : 1 - tokenProgress,
                    }}
                    transition={{ duration: 0.05, ease: "linear" }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Central HTC Hub (§B4) */}
        <div
          ref={hubRef}
          data-hub-node
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex h-40 w-40 flex-col items-center justify-center rounded-3xl bg-red-600 text-center text-white shadow-xl transition-all duration-300"
        >
          {/* Dispatch Inward Glow & Receive Outward Ripple */}
          {phase === "arrived" && currentStep.to === "console" && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 rounded-3xl border-2 border-red-300 pointer-events-none"
            />
          )}

          <span className="font-serif text-3xl font-bold tracking-wider text-white">HTC</span>
        </div>

        {/* 5 Outer Role Cards on Ellipse (§B3 & §B6) */}
        {(Object.values(ROLES) as RoleConfig[]).map((role) => {
          const pos = nodePositions[role.id] || { x: 0, y: 0 };
          const Icon = role.icon;
          const isHovered = hoveredRole === role.id;
          const isDimmed = hoveredRole !== null && hoveredRole !== role.id;
          const isReceiving = phase === "arrived" && currentStep.to === role.id;
          const isSending = phase === "inFlight" && currentStep.from === role.id;
          const isResolved = resolvedRole === role.id;

          return (
            <div
              key={role.id}
              ref={(el) => {
                roleRefs.current[role.id] = el;
              }}
              data-role-node={role.id}
              tabIndex={0}
              role="button"
              aria-describedby={`tooltip-${role.id}`}
              onMouseEnter={() => setHoveredRole(role.id)}
              onMouseLeave={() => setHoveredRole(null)}
              onFocus={() => setHoveredRole(role.id)}
              onBlur={() => setHoveredRole(null)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setHoveredRole(null);
              }}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
              className={`absolute z-10 flex min-w-[160px] items-center gap-3 rounded-xl border bg-surface-raised px-4 py-3 shadow-sm transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 cursor-pointer ${
                isHovered || isReceiving
                  ? "border-red-600 shadow-md ring-2 ring-red-100 scale-[1.04]"
                  : isSending
                  ? "border-red-300 shadow-sm -translate-y-1"
                  : "border-border-strong"
              } ${isDimmed ? "opacity-35" : "opacity-100"}`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper-100 text-text-primary">
                <Icon
                  className={`h-4.5 w-4.5 transition-transform duration-300 ${
                    isReceiving ? "rotate-6 text-red-600" : ""
                  }`}
                />
              </div>

              <div className="flex flex-col text-left">
                <span className="font-sans text-title-md font-semibold text-text-primary">
                  {role.label}
                </span>
                <span className="font-sans text-body-sm text-text-secondary whitespace-nowrap">
                  {role.sublabel}
                </span>
              </div>

              {/* Resolved Green Check Badge (§B6) */}
              {isResolved && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white shadow-md"
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.div>
              )}

              {/* Access Tooltip on Hover/Focus */}
              {isHovered && (
                <div
                  id={`tooltip-${role.id}`}
                  role="tooltip"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 w-56 rounded-lg bg-ink-900 p-2.5 text-xs text-paper-50 shadow-xl"
                >
                  <p className="leading-relaxed">{role.access}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink-900" />
                </div>
              )}
            </div>
          );
        })}

        {/* Upgraded Traveling Token Pill (§B5) */}
        {phase === "inFlight" && !reducedMotion && (
          <div
            data-token-pill
            style={{
              left: `${tokenPos.x}px`,
              top: `${tokenPos.y}px`,
              transform: `translate(-50%, -50%) rotate(${tokenPos.angle}deg)`,
              transition: "transform 0.05s linear",
            }}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-label font-semibold text-white shadow-lg pointer-events-none absolute z-20 ${
              isFinalToken ? "bg-green-600" : "bg-red-600"
            }`}
          >
            <TokenIcon className="h-3.5 w-3.5" />
            <span>{currentStep.tag}</span>
          </div>
        )}
      </div>

      {/* Mobile Vertical Flow Layout (< 768px: §B11) */}
      <div className="sm:hidden flex flex-col items-center gap-6 mt-6">
        <div
          data-hub-node
          className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-red-600 text-center text-white shadow-md"
        >
          <span className="font-serif text-2xl font-bold tracking-wider text-white">HTC</span>
        </div>

        <div className="relative flex flex-col gap-3.5 w-full pl-6 border-l-2 border-paper-300">
          {(Object.values(ROLES) as RoleConfig[]).map((role) => {
            const Icon = role.icon;
            const isSelected = hoveredRole === role.id;

            return (
              <div
                key={role.id}
                data-role-node={role.id}
                onClick={() => setHoveredRole(isSelected ? null : role.id)}
                className={`flex flex-col rounded-xl border bg-surface-raised p-3.5 shadow-sm transition-all min-h-[44px] cursor-pointer ${
                  isSelected ? "border-red-600 ring-2 ring-red-100" : "border-border-strong"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper-100 text-text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-sans text-sm font-semibold text-text-primary">
                      {role.label}
                    </span>
                    <span className="block font-sans text-xs text-text-secondary">{role.sublabel}</span>
                  </div>
                </div>
                {isSelected && (
                  <p className="mt-2 text-xs text-text-secondary border-t border-border-subtle pt-2">
                    {role.access}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Scenario Caption & Indicators (§B7) */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-border-subtle pt-4 gap-3">
        <div className="flex items-center gap-2">
          {SCENARIOS.map((sc, sIdx) => (
            <button
              key={sc.id}
              type="button"
              aria-label={`Jump to scenario: ${sc.title}`}
              onClick={() => {
                setScenarioIdx(sIdx);
                setStepIdx(0);
                setTokenProgress(0);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                scenarioIdx === sIdx ? "w-6 bg-red-600" : "w-2 bg-paper-300 hover:bg-paper-400"
              }`}
            />
          ))}
        </div>

        <div className="text-center sm:text-right">
          <span className="font-sans text-body-sm font-medium text-text-secondary">
            {currentScenario.caption}
          </span>
        </div>
      </div>
    </div>
  );
}
