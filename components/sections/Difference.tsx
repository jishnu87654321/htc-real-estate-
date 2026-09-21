/**
 * Difference.tsx — Revision 15 Definitive Rebuild
 *
 * Architecture: SCROLL SELECTS (SINGLE SOURCE), TIME ANIMATES
 * - Single scroll-progress source (useSteppedIndex)
 * - Ref-based fresh index tracking to eliminate stale closure bugs
 * - Self-healing transition watchdog (2000ms safety net)
 * - Step indicator and counter update instantly with activeStep
 * - Photo and card stack update smoothly via displayedStep
 * - Strict single owner per animated property
 */
"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  type RefObject,
} from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Placeholder } from "@/components/primitives/Placeholder";
import { useReducedMotion } from "@/lib/motion";
import availableImagesList from "@/lib/available-images.json";
import { PhotoTransition } from "@/components/ui/PhotoTransition";

// ─── Constants & Configuration ───────────────────────────────────────────────

const STEPS = 5;
const HYSTERESIS = 0.015; // 1.5% of total section progress
const MAX_CARD_STACK_HEIGHT = 420; // Hard clamp ceiling

const CARDS = [
  {
    n: "01",
    title: "We see vacancies first",
    body: "Notice periods are filed with the society, not the internet. Homes appear on HTC while they are still occupied.",
  },
  {
    n: "02",
    title: "Verified means a person checked",
    body: "Every listing is confirmed by the facility manager who works in that building, with a name attached to the check.",
  },
  {
    n: "03",
    title: "Move-in is already handled",
    body: "Your gate pass, maintenance account and resident profile are created the day the agreement is signed.",
  },
  {
    n: "04",
    title: "Someone fixes things after you move in",
    body: "The team that listed your home also runs the building. A complaint goes to people who already know the flat, and it is tracked until it is closed.",
  },
  {
    n: "05",
    title: "The price on the listing is the whole price",
    body: "Rent, deposit and the maintenance charge come from the society\u2019s own ledger. Nothing new appears at signing.",
  },
] as const;

const FRAME_IDS = [
  "home-difference-seq-02",
  "home-difference-seq-01",
  "home-difference-seq-03",
  "home-difference-seq-04",
  "home-difference-seq-05",
] as const;

const FRAME_LABELS = [
  "Full tower exterior at dusk, several windows lit",
  "Close crop: a single lit apartment window at dusk",
  "Wide: a cluster of towers, community scale, dusk",
  "Facility technician at work inside a home — natural light, warm, competent",
  "A calm, lived-in living room in the evening — lamps on, people at ease",
] as const;

const DIFF_META: Record<string, { focal: { x: number; y: number }; avgColor: string }> = {
  "home-difference-seq-01": { focal: { x: 0.5, y: 0.45 }, avgColor: "rgb(56, 63, 64)" },
  "home-difference-seq-02": { focal: { x: 0.52, y: 0.42 }, avgColor: "rgb(66, 90, 108)" },
  "home-difference-seq-03": { focal: { x: 0.5, y: 0.45 }, avgColor: "rgb(84, 83, 75)" },
  "home-difference-seq-04": { focal: { x: 0.5, y: 0.45 }, avgColor: "rgb(156, 138, 114)" },
  "home-difference-seq-05": { focal: { x: 0.5, y: 0.48 }, avgColor: "rgb(127, 105, 79)" },
};

// Index available images for O(1) lookup
const imageMap: Record<string, string> = {};
for (const item of availableImagesList as Array<{ id: string; path: string }>) {
  imageMap[item.id] = item.path;
}

const REV12_EASE = [0.25, 0.8, 0.3, 1] as const;

// ─── Helper: Velocity-based duration ─────────────────────────────────────────

function calculateVelocityBasedDuration(speedPxPerSec: number): number {
  const t = Math.min(speedPxPerSec / 2500, 1);
  return Math.round(380 - t * 180); // 380ms deliberate scroll → 200ms quick flick
}

// ─── Custom Hooks ────────────────────────────────────────────────────────────

/**
 * §4.2 useSteppedIndex
 * Turns continuous scroll progress into a discrete step index (0..4) with hysteresis.
 * Uses a synchronized activeStepRef to guarantee scroll callbacks never suffer from stale closures.
 */
function useSteppedIndex(
  sectionRef: RefObject<HTMLElement | null>,
  reducedMotion: boolean
) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const [activeStep, setActiveStep] = useState(0);

  // CRITICAL: a ref that always holds the latest activeStep.
  // The scroll-event callback below reads THIS, never the state variable
  // directly — that is what prevents the stale-closure freeze.
  const activeStepRef = useRef(0);
  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (reducedMotion) return;
    const band = 1 / STEPS;
    const rawTarget = Math.min(STEPS - 1, Math.max(0, Math.floor(progress / band)));
    const current = activeStepRef.current; // always fresh

    if (rawTarget === current) return;

    const boundary = rawTarget > current ? rawTarget * band : (rawTarget + 1) * band;
    if (Math.abs(progress - boundary) < HYSTERESIS) return; // not past buffer yet

    setActiveStep(rawTarget);
  });

  return { activeStep, scrollYProgress, setActiveStep };
}

type Phase = "idle" | "transitioning";

/**
 * §4.3 useStepTransition with §4.4 Velocity Duration & Defensive Watchdog
 */
function useStepTransition(activeStep: number, getSpeedPxPerSec: () => number) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayedStep, setDisplayedStep] = useState(activeStep);
  const [prevStep, setPrevStep] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [durationMs, setDurationMs] = useState(520);

  const pendingRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const transitionStartedAt = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayedStepRef = useRef(activeStep);

  const finishTransition = useCallback((landedOn: number) => {
    setDisplayedStep(landedOn);
    displayedStepRef.current = landedOn;
    setPrevStep(null);
    phaseRef.current = "idle";
    setPhase("idle");

    const next = pendingRef.current;
    pendingRef.current = null;
    if (next !== null && next !== landedOn) {
      startTransition(landedOn, next);
    }
  }, []);

  const startTransition = useCallback(
    (from: number, to: number) => {
      if (from === to) {
        phaseRef.current = "idle";
        setPhase("idle");
        setPrevStep(null);
        return;
      }
      const dir: 1 | -1 = to > from ? 1 : -1;
      setDirection(dir);
      setPrevStep(from);
      setDisplayedStep(to);
      displayedStepRef.current = to;

      phaseRef.current = "transitioning";
      setPhase("transitioning");
      transitionStartedAt.current = performance.now();

      const dur = calculateVelocityBasedDuration(getSpeedPxPerSec());
      setDurationMs(dur);

      if (timerRef.current) clearTimeout(timerRef.current);
      // The completion callback — this is the piece that must NEVER silently fail to fire.
      timerRef.current = setTimeout(() => {
        finishTransition(to);
      }, dur);
    },
    [finishTransition, getSpeedPxPerSec]
  );

  useEffect(() => {
    if (activeStep === displayedStepRef.current && phaseRef.current === "idle") {
      pendingRef.current = null;
      return;
    }

    if (phaseRef.current === "idle") {
      startTransition(displayedStepRef.current, activeStep);
    } else {
      pendingRef.current = activeStep; // queue only the latest target
    }
  }, [activeStep, startTransition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // WATCHDOG: if a transition has been "in progress" for far longer than any
  // legitimate transition could take, something is broken — force-recover
  // rather than freezing the section permanently. This is a safety net, not
  // a substitute for fixing the real cause found in §3.
  useEffect(() => {
    const WATCHDOG_MS = 2000; // generous multiple of the longest real transition
    const id = window.setInterval(() => {
      if (
        phaseRef.current === "transitioning" &&
        performance.now() - transitionStartedAt.current > WATCHDOG_MS
      ) {
        console.error(
          '[difference-section] transition watchdog fired — phase was stuck in "transitioning". ' +
            "This indicates the completion callback did not fire. Forcing recovery."
        );
        finishTransition(activeStep);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [activeStep, finishTransition]);

  return { displayedStep, prevStep, direction, phase, durationMs };
}

// ─── Components ───────────────────────────────────────────────────────────────

function DifferenceCard({
  card,
  state,
  durationMs = 520,
}: {
  card: (typeof CARDS)[number];
  state: "active" | "incoming" | "outgoing-up" | "outgoing-down";
  direction: 1 | -1;
  durationMs?: number;
}) {
  const k = Math.max(0.15, durationMs / 520);
  const outDuration = Math.max(0.06, 0.18 * k);
  const inDuration = Math.max(0.09, 0.30 * k);
  const inDelay = 0.12 * k;

  return (
    <motion.article
      data-card={card.n}
      initial={false}
      animate={
        state === "active" || state === "incoming"
          ? { opacity: 1, y: 0 }
          : state === "outgoing-up"
          ? { opacity: 0, y: -16 }
          : { opacity: 0, y: 16 }
      }
      transition={
        state === "incoming"
          ? {
              opacity: { duration: inDuration, delay: inDelay, ease: REV12_EASE },
              y: { duration: inDuration, delay: inDelay, ease: REV12_EASE },
            }
          : {
              opacity: { duration: outDuration, ease: REV12_EASE },
              y: { duration: outDuration, ease: REV12_EASE },
            }
      }
      className="absolute inset-x-0 top-0 flex flex-col justify-start rounded-xl border border-border-subtle bg-surface-raised p-6 shadow-sm"
      style={{ pointerEvents: state === "active" ? "auto" : "none" }}
    >
      <span className="font-serif text-display-sm text-red-600 select-none">
        {card.n}
      </span>
      <h3 className="mt-2 text-title-lg font-semibold text-text-primary">
        {card.title}
      </h3>
      <p className="mt-2 text-body-md text-text-secondary leading-relaxed">
        {card.body}
      </p>
    </motion.article>
  );
}

function DifferenceCardStatic({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-6 shadow-sm">
      <span className="font-serif text-display-sm text-red-600">{n}</span>
      <h3 className="mt-2 text-title-lg font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mt-2 text-body-md text-text-secondary">{body}</p>
    </div>
  );
}

function RollingCounter({ value, total }: { value: number; total: number }) {
  return (
    <div
      data-difference-counter
      className="flex items-baseline gap-1 font-mono text-label text-ink-400"
    >
      <span
        data-counter-current
        className="inline-block tabular-nums font-semibold text-text-primary"
      >
        {String(value + 1).padStart(2, "0")}
      </span>
      <span className="text-ink-400 opacity-60">
        {" "}/ {String(total).padStart(2, "0")}
      </span>
    </div>
  );
}

function measureStack(stackEl: HTMLElement) {
  const cards = stackEl.querySelectorAll<HTMLElement>("[data-card]");
  let max = 0;
  cards.forEach((c) => {
    const prev = c.style.cssText;
    c.style.cssText +=
      ";position:relative;visibility:hidden;opacity:1;transform:none;height:auto";
    max = Math.max(max, c.offsetHeight);
    c.style.cssText = prev;
  });

  if (max > MAX_CARD_STACK_HEIGHT) {
    console.warn(
      `[Difference] Card stack measurement exceeded ${MAX_CARD_STACK_HEIGHT}px (${max}px). Clamping.`
    );
    max = MAX_CARD_STACK_HEIGHT;
  }

  const finalH = Math.max(180, Math.ceil(max));
  stackEl.style.setProperty("--card-stack-h", `${finalH}px`);
  return finalH;
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function Difference() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardStackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Scroll speed tracking (ref-based, zero re-renders)
  const lastScrollTime = useRef(0);
  const lastScrollY = useRef(0);
  const scrollSpeedRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const now = performance.now();
      const dt = now - lastScrollTime.current;
      const dy = Math.abs(window.scrollY - lastScrollY.current);
      if (dt > 0) {
        scrollSpeedRef.current = (dy / dt) * 1000;
      }
      lastScrollTime.current = now;
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getSpeedPxPerSec = useCallback(() => scrollSpeedRef.current, []);

  // §4.2 Scroll -> Step Index with stale-closure prevention
  const { activeStep, scrollYProgress, setActiveStep } = useSteppedIndex(
    sectionRef,
    reducedMotion
  );

  // §4.3 Transition Engine with self-healing watchdog
  const { displayedStep, prevStep, direction, phase, durationMs } =
    useStepTransition(activeStep, getSpeedPxPerSec);

  // Card stack height measurement (§3.3)
  const [cardStackH, setCardStackH] = useState(220);

  useLayoutEffect(() => {
    const runMeasure = () => {
      if (!cardStackRef.current) return;
      const h = measureStack(cardStackRef.current);
      if (h > 0) setCardStackH(h);
    };

    runMeasure();

    let lastWidth = cardStackRef.current?.offsetWidth || 0;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (Math.abs(w - lastWidth) > 2) {
          lastWidth = w;
          runMeasure();
        }
      }
    });

    if (cardStackRef.current) ro.observe(cardStackRef.current);

    document.fonts.ready.then(() => {
      runMeasure();
    });

    window.addEventListener("resize", runMeasure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", runMeasure);
    };
  }, []);

  // Continuous parallax rail fill
  const [progressPct, setProgressPct] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setProgressPct(Math.min(100, Math.max(0, p * 100)));
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-2%", "2%"]);

  // Scroll to step helper (for clickable indicator)
  const scrollToStep = useCallback(
    (idx: number) => {
      setActiveStep(idx);
      if (!sectionRef.current) return;
      const totalH = sectionRef.current.scrollHeight;
      const band = totalH / STEPS;
      const target = sectionRef.current.offsetTop + band * idx + band * 0.5;
      window.scrollTo({ top: target, behavior: "smooth" });
    },
    [setActiveStep]
  );

  // Preload adjacent frames
  useEffect(() => {
    const prefetch = (idx: number) => {
      const id = FRAME_IDS[idx];
      if (!id) return;
      const path = imageMap[id];
      if (!path) return;
      const img = new window.Image();
      img.src = path;
    };
    prefetch(displayedStep - 1);
    prefetch(displayedStep + 1);
  }, [displayedStep]);

  // Reduced motion view
  if (reducedMotion) {
    return (
      <section data-difference className="py-20 bg-surface-page">
        <Container>
          <h2 className="font-serif text-display-md text-text-primary">
            Most listing sites start with the listing. We start with the community.
          </h2>
          <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">
            A portal takes whatever a poster uploads and hopes it is real. We already manage the building. The
            listing comes from the facility team, the vacancy date comes from the society register, and your
            move-in — gate pass, maintenance account, resident directory — is set up on the same platform
            before you get the keys.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 items-start">
            <div className="flex flex-col gap-6">
              {CARDS.map((card) => (
                <DifferenceCardStatic key={card.n} {...card} />
              ))}
            </div>
            <Placeholder
              id={FRAME_IDS[0]}
              ratio="4/5"
              label={FRAME_LABELS[0]}
              className="w-full rounded-xl border border-border-subtle bg-surface-raised p-2 shadow-md"
            />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <>
      {/* ── Desktop sticky section (md+) ──────────────────────────────────── */}
      <section
        ref={sectionRef}
        data-difference
        data-difference-desktop
        data-difference-phase={phase}
        className="relative hidden isolate bg-surface-page md:block"
        style={{
          height: `calc(100vh + 60vh * ${STEPS - 1})`,
          ["--steps" as string]: String(STEPS),
        }}
      >
        <div
          data-sticky-container
          style={{
            top: "var(--header-h, 72px)",
            height: "calc(100vh - var(--header-h, 72px))",
          }}
          className="sticky flex items-center"
        >
          <Container className="grid grid-cols-12 items-center gap-12 lg:gap-16 w-full">
            {/* Left column: heading, indicator, card stack */}
            <div
              data-difference-left
              className="col-span-6 flex flex-col justify-center max-w-xl"
            >
              <h2 className="font-serif text-display-md text-text-primary">
                Most listing sites start with the listing. We start with the community.
              </h2>
              <p className="mt-4 text-body-md text-text-secondary leading-relaxed">
                A portal takes whatever a poster uploads and hopes it is real. We already manage the building. The
                listing comes from the facility team, the vacancy date comes from the society register, and your
                move-in is set up on the same platform before you get the keys.
              </p>

              {/* Step Indicator — Instant acknowledgement (§A2.5: follows activeStep immediately) */}
              <div
                data-step-indicator
                className="mt-6 flex items-center gap-6 border-b border-border-subtle pb-3"
              >
                {CARDS.map((card, i) => {
                  const isActiveStep = activeStep === i;
                  return (
                    <button
                      key={card.n}
                      data-step={String(i)}
                      type="button"
                      onClick={() => scrollToStep(i)}
                      aria-label={`Go to step ${card.n}`}
                      aria-current={isActiveStep ? "true" : undefined}
                      className="relative pb-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
                    >
                      <span
                        className={`font-mono text-title-sm transition-colors duration-150 ${
                          isActiveStep
                            ? "text-red-600 font-semibold"
                            : "text-ink-400 opacity-50 font-normal"
                        }`}
                      >
                        {card.n}
                      </span>
                      {isActiveStep && (
                        <motion.div
                          layoutId="difference-step-underline"
                          className="absolute -bottom-3 left-0 right-0 h-0.5 bg-red-600 rounded-full"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 32,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Card Stack Container (§3.3: bounded height, top-0 cards) */}
              <div
                ref={cardStackRef}
                data-card-stack
                className="relative mt-6 w-full"
                style={{ height: `${cardStackH}px` }}
              >
                {CARDS.map((card, i) => {
                  const isDisplayed = displayedStep === i;
                  const isPrev = prevStep === i;
                  let cardState:
                    | "active"
                    | "incoming"
                    | "outgoing-up"
                    | "outgoing-down";
                  if (isDisplayed && phase !== "idle") cardState = "incoming";
                  else if (isDisplayed) cardState = "active";
                  else if (isPrev && direction === 1) cardState = "outgoing-up";
                  else if (isPrev) cardState = "outgoing-down";
                  else return null;

                  return (
                    <DifferenceCard
                      key={card.n}
                      card={card}
                      state={cardState}
                      direction={direction}
                      durationMs={durationMs}
                    />
                  );
                })}
              </div>
            </div>

            {/* Right column: frame + rail */}
            <div
              data-difference-right
              className="col-span-6 flex items-center justify-center"
            >
              {/* Progress rail with tick marks */}
              <div className="relative mr-3 self-stretch shrink-0 flex flex-col items-center">
                <div className="relative flex-1 w-0.5 rounded-full bg-paper-200 overflow-visible my-2">
                  <div
                    className="absolute top-0 left-0 right-0 bg-red-600 origin-top rounded-full transition-none"
                    style={{ height: `${progressPct}%` }}
                  />
                  {Array.from({ length: STEPS - 1 }).map((_, i) => {
                    const pct = ((i + 1) / STEPS) * 100;
                    return (
                      <div
                        key={i}
                        className="absolute left-1/2 -translate-x-1/2 w-2 h-0.5 rounded-full"
                        style={{
                          top: `${pct}%`,
                          backgroundColor:
                            progressPct >= pct
                              ? "var(--red-600)"
                              : "var(--paper-300)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Frame container */}
              <div className="relative flex-1 flex flex-col">
                <div
                  className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-2xl"
                  style={{ aspectRatio: "4 / 5" }}
                >
                  <motion.div className="absolute inset-0" style={{ y: parallaxY }}>
                    <PhotoTransition
                      currentSlide={{
                        id: FRAME_IDS[displayedStep],
                        src: imageMap[FRAME_IDS[displayedStep]] || `/sequences/${FRAME_IDS[displayedStep]}.jpg`,
                        alt: FRAME_LABELS[displayedStep],
                        focal: DIFF_META[FRAME_IDS[displayedStep]]?.focal,
                        avgColor: DIFF_META[FRAME_IDS[displayedStep]]?.avgColor,
                        priority: displayedStep === 0,
                      }}
                      prevSlide={
                        prevStep !== null
                          ? {
                              id: FRAME_IDS[prevStep],
                              src: imageMap[FRAME_IDS[prevStep]] || `/sequences/${FRAME_IDS[prevStep]}.jpg`,
                              alt: FRAME_LABELS[prevStep],
                              focal: DIFF_META[FRAME_IDS[prevStep]]?.focal,
                              avgColor: DIFF_META[FRAME_IDS[prevStep]]?.avgColor,
                            }
                          : undefined
                      }
                      mode="difference"
                      direction={direction}
                      revealMs={durationMs}
                      revealEase="cubic-bezier(0.16, 1, 0.3, 1)"
                      enableSheen={false}
                      reducedMotion={reducedMotion}
                      className="absolute inset-0 h-full w-full"
                      sizes="(min-width: 1024px) 45vw, 100vw"
                    />
                  </motion.div>

                  {/* Rolling counter bottom-right — instant acknowledgement via activeStep */}
                  <div className="absolute bottom-3 right-4 z-20 rounded-full bg-surface-raised/90 px-2.5 py-1 border border-border-subtle backdrop-blur-sm shadow-sm">
                    <RollingCounter value={activeStep} total={STEPS} />
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* ── Mobile section (< md): five stacked pairs, no sticky ──────────── */}
      <section
        data-difference
        data-difference-mobile
        className="block py-16 bg-surface-page md:hidden"
      >
        <Container>
          <h2 className="font-serif text-display-md text-text-primary">
            Most listing sites start with the listing. We start with the community.
          </h2>
          <p className="mt-4 text-body-md text-text-secondary">
            A portal takes whatever a poster uploads and hopes it is real. We already manage the building.
          </p>

          <div className="mt-10 flex flex-col gap-8">
            {CARDS.map((card, i) => (
              <div key={card.n} className="flex flex-col gap-3">
                {imageMap[FRAME_IDS[i]] ? (
                  <div
                    className="relative w-full overflow-hidden rounded-xl border border-border-subtle shadow-sm"
                    style={{ aspectRatio: "4 / 3" }}
                  >
                    <Image
                      src={imageMap[FRAME_IDS[i]]}
                      alt={FRAME_LABELS[i]}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      style={{
                        objectPosition: `${(DIFF_META[FRAME_IDS[i]]?.focal.x || 0.5) * 100}% ${(DIFF_META[FRAME_IDS[i]]?.focal.y || 0.5) * 100}%`,
                      }}
                    />
                  </div>
                ) : (
                  <Placeholder
                    id={FRAME_IDS[i]}
                    ratio="4/3"
                    label={FRAME_LABELS[i]}
                    className="rounded-xl border border-border-subtle bg-surface-raised p-2 shadow-sm"
                  />
                )}
                <DifferenceCardStatic {...card} />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
