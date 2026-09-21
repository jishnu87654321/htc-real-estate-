"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
  AnimatePresence,
} from "motion/react";
import { Placeholder, type AspectRatioType } from "@/components/primitives/Placeholder";
import { useReducedMotion } from "@/lib/motion";

export interface SequenceFrame {
  id?: string;
  label: string;      // photographer instruction
  caption?: string;   // optional caption
  chip?: string;      // interactive module chip (e.g. for filmstrip)
}

export interface ScrollSequenceProps {
  id: string;                    // base ID; frames get -01, -02...
  frames: SequenceFrame[];       // 3–8 frames
  mode?: "crossfade";
  ratio?: AspectRatioType;       // default "4/5"
  sticky?: boolean;              // default true
  progress?: MotionValue<number>;// optional external scroll driver
  caption?: boolean;             // render frame caption, default true
  activeFrameIndex?: number;     // optional externally controlled frame index
  onFrameSelect?: (index: number) => void;
  className?: string;
  autoPlayInterval?: number;     // ms for hero timer mode (when sticky=false)
}

export function ScrollSequence({
  id,
  frames,
  mode = "crossfade",
  ratio = "4/5",
  sticky = true,
  progress: externalProgress,
  activeFrameIndex,
  className = "",
  autoPlayInterval,
}: ScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [activeTimerIndex, setActiveTimerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Global scroll direction detection with 2px jitter threshold
  const { scrollY } = useScroll();
  const scrollDirection = useRef<1 | -1>(1);
  useMotionValueEvent(scrollY, "change", (cur) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(cur - prev) > 2) {
      scrollDirection.current = cur > prev ? 1 : -1;
    }
  });

  // Internal scroll tracker if no external progress provided
  const { scrollYProgress: internalProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scrollProgress = externalProgress ?? internalProgress;

  // Auto-play timer for hero / non-sticky modes
  useEffect(() => {
    if (sticky || !autoPlayInterval || isPaused || reducedMotion) return;
    const interval = setInterval(() => {
      setActiveTimerIndex((prev) => (prev + 1) % frames.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlayInterval, frames.length, isPaused, reducedMotion, sticky]);

  const currentIndex = activeFrameIndex !== undefined ? activeFrameIndex : activeTimerIndex;
  const totalFrames = frames.length;

  // Progress rail fill height (0 to 100%)
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (externalProgress) {
      const unsub = externalProgress.on("change", (latest) => {
        setProgressPercent(Math.min(Math.max(latest * 100, 0), 100));
      });
      return () => unsub();
    }
  }, [externalProgress]);

  const currentPercent = externalProgress
    ? progressPercent
    : ((currentIndex + 1) / totalFrames) * 100;

  // Reduced motion: render first frame static
  if (reducedMotion) {
    const frame = frames[0];
    const frameId = frame.id || `${id}-01`;
    return (
      <div className={`relative rounded-xl border border-border-subtle bg-surface-raised p-2 shadow-lg ${className}`}>
        <Placeholder id={frameId} ratio={ratio} label={frame.label} variant="sequence" className="h-full w-full rounded-lg" />
        <div className="mt-2 text-right font-mono text-label text-ink-400">01 / {String(totalFrames).padStart(2, "0")}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Desktop / Tablet View (≥ 768px) */}
      <div className="hidden md:flex items-stretch gap-2">
        {/* Attached Flush Progress Rail */}
        <div className="relative w-0.5 self-stretch shrink-0 rounded-full bg-paper-200 overflow-hidden my-2">
          <motion.div
            className="w-full bg-red-600 origin-top"
            style={{ height: `${currentPercent}%` }}
            transition={{ ease: "easeOut", duration: 0.15 }}
          />
        </div>

        {/* Framing Container */}
        <div
          className="relative flex-1 overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-lg"
          style={{ aspectRatio: ratio.replace("/", " / ") }}
        >
          {/* Crossfade */}
          <CrossfadeSequence
            id={id}
            frames={frames}
            ratio={ratio}
            progress={scrollProgress}
            direction={scrollDirection}
            controlledIndex={activeFrameIndex !== undefined ? activeFrameIndex : (!sticky ? currentIndex : undefined)}
          />

          {/* Frame Counter in bottom corner */}
          <div className="absolute bottom-3 right-4 z-20 rounded-full bg-surface-raised/90 px-2.5 py-0.5 font-mono text-label font-medium text-ink-400 shadow-sm border border-border-subtle backdrop-blur-sm">
            {String(
              activeFrameIndex !== undefined
                ? activeFrameIndex + 1
                : sticky
                ? Math.min(Math.floor((currentPercent / 100) * totalFrames) + 1, totalFrames)
                : currentIndex + 1
            ).padStart(2, "0")}{" "}
            / {String(totalFrames).padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* Mobile View (< 768px): Horizontal Snap-Scroll Carousel with Dot Indicators */}
      <div className="block md:hidden">
        <div
          tabIndex={0}
          role="region"
          aria-label="Sequence preview cards"
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 no-scrollbar focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          {frames.map((frame, index) => {
            const frameId = frame.id || `${id}-${String(index + 1).padStart(2, "0")}`;
            return (
              <div
                key={frameId}
                className="w-[85vw] shrink-0 snap-center rounded-xl border border-border-subtle bg-surface-raised p-2 shadow-md"
              >
                <Placeholder
                  id={frameId}
                  ratio={ratio}
                  label={frame.label}
                  variant="sequence"
                  className="h-full w-full rounded-lg"
                />
                {frame.caption && (
                  <p className="mt-2 text-center text-body-sm text-text-secondary">{frame.caption}</p>
                )}
                {frame.chip && (
                  <div className="mt-2 text-center">
                    <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-label font-medium text-red-700">
                      {frame.chip}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Swipe Indicators */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {frames.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === 0 ? "w-4 bg-red-600" : "w-1.5 bg-paper-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Direction-Aware Crossfade Sequence Implementation (§5.2)
 */
function CrossfadeSequence({
  id,
  frames,
  ratio,
  progress,
  direction,
  controlledIndex,
}: {
  id: string;
  frames: SequenceFrame[];
  ratio: AspectRatioType;
  progress: MotionValue<number>;
  direction: React.RefObject<1 | -1>;
  controlledIndex?: number;
}) {
  const total = frames.length;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {frames.map((frame, i) => {
        const frameId = frame.id || `${id}-${String(i + 1).padStart(2, "0")}`;

        if (controlledIndex !== undefined) {
          const isActive = controlledIndex === i;
          return (
            <motion.div
              key={frameId}
              className="absolute inset-0 h-full w-full"
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                y: isActive ? 0 : 48,
                scale: isActive ? 1 : 1.04,
                filter: isActive ? "blur(0px)" : "blur(6px)",
              }}
              transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
              style={{ display: isActive ? "block" : "none" }}
            >
              <Placeholder
                id={frameId}
                ratio={ratio}
                label={frame.label}
                variant="sequence"
                className="h-full w-full rounded-lg"
              />
            </motion.div>
          );
        }

        // Scroll driven with 25% overlapping bands and 48px direction travel (§5.2)
        const bandStart = Math.max(0, (i - 0.25) / total);
        const bandPeak = (i + 0.5) / total;
        const bandEnd = Math.min(1, (i + 1.25) / total);

        return (
          <CrossfadeFrame
            key={frameId}
            frameId={frameId}
            label={frame.label}
            ratio={ratio}
            progress={progress}
            range={[bandStart, bandPeak, bandEnd]}
            direction={direction}
            isFirst={i === 0}
            isLast={i === total - 1}
          />
        );
      })}
    </div>
  );
}

function CrossfadeFrame({
  frameId,
  label,
  ratio,
  progress,
  range,
  direction,
  isFirst,
  isLast,
}: {
  frameId: string;
  label: string;
  ratio: AspectRatioType;
  progress: MotionValue<number>;
  range: [number, number, number];
  direction: React.RefObject<1 | -1>;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [inRange, setInRange] = useState(true);

  const opacity = useTransform(progress, (v) => {
    if (isFirst && v <= range[0]) return 1;
    if (isLast && v >= range[2]) return 1;
    if (v < range[0] || v > range[2]) return 0;
    if (v <= range[1]) {
      return (v - range[0]) / (range[1] - range[0]);
    }
    return 1 - (v - range[1]) / (range[2] - range[1]);
  });

  const y = useTransform(progress, (v) => {
    const dir = direction.current ?? 1;
    if (isFirst && v <= range[0]) return 0;
    if (isLast && v >= range[2]) return 0;
    if (v < range[0]) return dir * 48;
    if (v > range[2]) return dir * -48;
    if (v <= range[1]) {
      // Incoming: 48px -> 0
      const progressToPeak = (v - range[0]) / (range[1] - range[0]);
      return dir * (48 * (1 - progressToPeak));
    }
    // Outgoing: 0 -> -48px
    const progressFromPeak = (v - range[1]) / (range[2] - range[1]);
    return dir * (-48 * progressFromPeak);
  });

  const scale = useTransform(progress, (v) => {
    if (v < range[0]) return 1.04;
    if (v > range[2]) return 0.96;
    if (v <= range[1]) {
      const progressToPeak = (v - range[0]) / (range[1] - range[0]);
      return 1.04 - 0.04 * progressToPeak;
    }
    const progressFromPeak = (v - range[1]) / (range[2] - range[1]);
    return 1.0 - 0.04 * progressFromPeak;
  });

  const blurAmount = useTransform(progress, (v) => {
    if (isFirst && v <= range[0]) return "blur(0px)";
    if (isLast && v >= range[2]) return "blur(0px)";
    if (v < range[0] || v > range[2]) return "blur(6px)";
    if (v <= range[1]) {
      const p = (v - range[0]) / (range[1] - range[0]);
      return `blur(${6 * (1 - p)}px)`;
    }
    const p = (v - range[1]) / (range[2] - range[1]);
    return `blur(${6 * p}px)`;
  });

  useMotionValueEvent(opacity, "change", (latest) => {
    setInRange(latest > 0.01 || isFirst || isLast);
  });

  return (
    <motion.div
      className="absolute inset-0 h-full w-full"
      style={{
        opacity,
        y,
        scale,
        filter: blurAmount,
        display: inRange ? "block" : "none",
      }}
    >
      <Placeholder
        id={frameId}
        ratio={ratio}
        label={label}
        variant="sequence"
        className="h-full w-full rounded-lg"
      />
    </motion.div>
  );
}
