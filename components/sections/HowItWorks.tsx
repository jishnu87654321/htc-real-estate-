"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/primitives/Button";
import { ease, useReducedMotion } from "@/lib/motion";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const STEPS = [
  {
    n: "1",
    title: "Search and shortlist",
    body: "Filter by locality, budget and community. Every listing shows the real maintenance charge, not an estimate.",
  },
  {
    n: "2",
    title: "Talk to the owner directly",
    body: "Contact details are yours the moment you are verified. We do not sit in the middle and we do not sell your number.",
  },
  {
    n: "3",
    title: "Move in on the same platform",
    body: "Agreement, gate pass and maintenance account, all set up before handover day.",
  },
];

interface Point {
  x: number;
  y: number;
  r: number;
}

interface StepGeometry {
  points: Point[];
  pathD: string;
  reach2: number;
}

function useStepGeometry(trackRef: React.RefObject<HTMLDivElement | null>) {
  const [geometry, setGeometry] = useState<StepGeometry | null>(null);

  useIsomorphicLayoutEffect(() => {
    let animationFrameId: number;

    const measure = () => {
      const trackEl = trackRef.current;
      if (!trackEl) return;

      const track = trackEl.getBoundingClientRect();
      const markerEls = Array.from(trackEl.querySelectorAll<HTMLElement>("[data-step-marker]"));
      if (markerEls.length < 3) return;

      const pts: Point[] = markerEls.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - track.left,
          y: r.top + r.height / 2 - track.top,
          r: r.width / 2,
        };
      });

      const totalDist = Math.hypot(pts[2].x - pts[0].x, pts[2].y - pts[0].y);
      const reach2Dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const reach2 = totalDist > 0 ? reach2Dist / totalDist : 0.5;

      const pathD = `M ${pts[0].x} ${pts[0].y} L ${pts[2].x} ${pts[2].y}`;

      setGeometry({
        points: pts,
        pathD,
        reach2,
      });
    };

    const scheduleMeasure = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(measure);
    };

    // Immediate synchronous measurement on client mount
    measure();

    // Re-measure after fonts load
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(scheduleMeasure).catch(() => {});
    }

    // ResizeObserver on the shared track containing block
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && trackRef.current) {
      ro = new ResizeObserver(() => {
        scheduleMeasure();
      });
      ro.observe(trackRef.current);
    }

    window.addEventListener("resize", scheduleMeasure);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [trackRef]);

  return geometry;
}

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const geometry = useStepGeometry(trackRef);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 75%", "end 60%"],
  });

  const pathLengthMotion = useTransform(scrollYProgress, [0.05, 0.95], [0, 1], { clamp: true });

  const [reachedIndex, setReachedIndex] = useState<number>(0);
  const [hasReachedEnd, setHasReachedEnd] = useState<boolean>(false);

  const reach2 = geometry?.reach2 ?? 0.5;

  useMotionValueEvent(pathLengthMotion, "change", (latest) => {
    if (reducedMotion) return;

    let current = 0;
    if (latest >= 0.999) {
      current = 3;
      setHasReachedEnd(true);
    } else if (latest >= reach2) {
      current = 2;
    } else if (latest >= 0) {
      current = 1;
    }

    setReachedIndex(current);
  });

  const effectiveReached = reducedMotion ? 3 : reachedIndex;
  const isCtaVisible = reducedMotion || hasReachedEnd;

  return (
    <Section id="how-it-works" className="isolate bg-surface-page">
      <section ref={sectionRef} data-steps className="isolate">
        <Container>
          <Reveal>
            <h2 className="text-center font-serif text-display-md text-text-primary">
              Three steps. No broker in any of them.
            </h2>
          </Reveal>

          <div ref={trackRef} data-steps-track className="relative mt-16">
            {/* Measured Connector Line SVG */}
            <svg
              data-step-connector
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-visible"
              style={{ zIndex: 0 }}
            >
              <path
                data-connector-track
                d={geometry?.pathD || ""}
                stroke="var(--paper-300)"
                strokeWidth="2"
                fill="none"
              />
              <motion.path
                data-connector-fill
                d={geometry?.pathD || ""}
                stroke="var(--red-600)"
                strokeWidth="2"
                fill="none"
                style={{ pathLength: reducedMotion ? 1 : pathLengthMotion }}
              />
            </svg>

            {/* Semantic Ordered List for Accessibility */}
            <ol className="relative grid grid-cols-1 gap-12 md:grid-cols-3" style={{ zIndex: 1 }}>
              {STEPS.map((step, i) => {
                const stepNum = i + 1;
                const isReached = effectiveReached >= stepNum;

                return (
                  <li key={step.n} data-step={i} className="flex flex-col items-start text-left">
                    <div className="relative">
                      {/* Pulse Soft Ring */}
                      {!reducedMotion && isReached && (
                        <motion.span
                          key={`ring-${stepNum}`}
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 1.8, opacity: 0 }}
                          transition={{ duration: 0.6, ease: ease.out }}
                          className="pointer-events-none absolute inset-0 rounded-full bg-red-200"
                        />
                      )}

                      {/* Opaque Step Marker */}
                      <motion.span
                        data-step-marker
                        initial={false}
                        animate={
                          reducedMotion
                            ? { scale: 1 }
                            : isReached
                            ? { scale: [1, 1.12, 1] }
                            : { scale: 0.9 }
                        }
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : isReached
                            ? { duration: 0.35, ease: ease.out }
                            : { duration: 0.2 }
                        }
                        className={`relative z-10 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full font-serif text-[1.375rem] font-normal pt-[2px] leading-none select-none transition-colors duration-300 shadow-sm ${
                          isReached
                            ? "bg-red-600 text-white border-[1.5px] border-red-600"
                            : "bg-white text-ink-400 border-[1.5px] border-paper-300"
                        }`}
                      >
                        {step.n}
                      </motion.span>
                    </div>

                    {/* Step Heading and Body Content */}
                    <motion.div
                      initial={false}
                      animate={
                        reducedMotion || isReached
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0.45, y: 8 }
                      }
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                      }
                      className="flex flex-col items-start"
                    >
                      <h3 className="mt-6 text-title-lg font-semibold text-text-primary">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-[36ch] text-body-md text-text-secondary leading-relaxed">
                        {step.body}
                      </p>
                    </motion.div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* CTA: Latched visibility once reached step 3 */}
          <motion.div
            initial={false}
            animate={
              reducedMotion || isCtaVisible
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 12 }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.3, ease: ease.out }
            }
            className="mt-16 text-center"
          >
            <Button href="/properties" variant="primary" size="lg">
              Start searching
            </Button>
          </motion.div>
        </Container>
      </section>
    </Section>
  );
}
