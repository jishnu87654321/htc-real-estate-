"use client";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { SiteImage } from "@/components/primitives/SiteImage";
import { useReducedMotion } from "@/lib/motion";

export interface CarouselSlide {
  id: string;
  alt: string;
  focal?: { x: number; y: number };
  caption?: { label: string; detail: string };
}

export interface ThumbnailCarouselProps {
  slides: CarouselSlide[];
  label?: string;
  intervalMs?: number;
  aspect?: { desktop: string; mobile: string };
  showCaption?: boolean;
  badgePosition?: "bottom-left" | "top-left";
  className?: string;
}

const DEFAULT_INTERVAL_MS = 4000;
const DRAG_DISTANCE = 60;
const DRAG_VELOCITY = 400;
const SPRING = { type: "spring", stiffness: 260, damping: 32, mass: 1 } as const;

export function ThumbnailCarousel({
  slides,
  label = "Property photos",
  intervalMs = DEFAULT_INTERVAL_MS,
  aspect = { desktop: "1/1", mobile: "4/3" },
  showCaption = false,
  badgePosition,
  className = "",
}: ThumbnailCarouselProps) {
  const n = slides.length;
  const reduce = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false); // slide 01 decoded + window loaded
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [inView, setInView] = useState(true);

  const effectiveBadgePosition =
    badgePosition ?? (showCaption ? "top-left" : "bottom-left");

  const x = useMotionValue(0);
  const stripOpacity = useMotionValue(1);
  const progress = useMotionValue(0);
  const elapsed = useRef(0);

  const indexRef = useRef(index);
  const widthRef = useRef(width);

  useEffect(() => {
    indexRef.current = index;
    widthRef.current = width;
  }, [index, width]);

  // ── Measure viewport width ───────────────────────────────────────────────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setWidth(w);
      x.set(-indexRef.current * w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [x]);

  // ── Visibility threshold (≥ 40% in view) ─────────────────────────────────
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.intersectionRatio >= 0.4),
      { threshold: [0, 0.4, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ── Navigation (single unified entry point) ──────────────────────────────
  const goTo = useCallback(
    (target: number, opts: { wrap?: boolean } = {}) => {
      const w = widthRef.current;
      let next = target;
      if (opts.wrap) next = ((target % n) + n) % n;
      else next = Math.max(0, Math.min(n - 1, target));
      const from = indexRef.current;

      elapsed.current = 0;
      progress.set(0);
      setIndex(next);
      indexRef.current = next;
      if (!w) return;

      if (reduce) {
        x.set(-next * w);
        return;
      }

      const isWrapJump = opts.wrap && Math.abs(next - from) > 1;
      if (isWrapJump) {
        animate(stripOpacity, 0, { duration: 0.15 }).then(() => {
          x.set(-next * w);
          animate(stripOpacity, 1, { duration: 0.25 });
        });
      } else {
        animate(x, -next * w, SPRING);
      }
    },
    [n, progress, reduce, stripOpacity, x]
  );

  const goToRef = useRef(goTo);
  useEffect(() => {
    goToRef.current = goTo;
  }, [goTo]);

  // ── Single clock loop with pause reasons ─────────────────────────────────
  const paused =
    !!reduce ||
    !ready ||
    userPaused ||
    hovering ||
    focusWithin ||
    dragging ||
    !inView;
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50); // clamp: prevents frame burst after tab return
      last = now;
      if (!pausedRef.current && !document.hidden) {
        elapsed.current += dt;
        progress.set(Math.min(elapsed.current / intervalMs, 1));
        if (elapsed.current >= intervalMs) {
          goToRef.current(indexRef.current + 1, { wrap: true });
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [intervalMs, progress]);

  // ── Drag gestures ────────────────────────────────────────────────────────
  const onDragEnd = (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    setDragging(false);
    const { offset, velocity } = info;
    if (offset.x < -DRAG_DISTANCE || velocity.x < -DRAG_VELOCITY) {
      goTo(indexRef.current + 1);
    } else if (offset.x > DRAG_DISTANCE || velocity.x > DRAG_VELOCITY) {
      goTo(indexRef.current - 1);
    } else {
      animate(x, -indexRef.current * widthRef.current, SPRING);
    }
  };

  // ── Keyboard support ─────────────────────────────────────────────────────
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(indexRef.current + 1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(indexRef.current - 1);
    }
  };

  const progressScale = useTransform(progress, (p) => p);

  // Derive responsive aspect ratio classes or inline styles
  const isDefaultSquareDesktop = aspect.desktop === "1/1" && aspect.mobile === "4/3";
  const aspectClass = isDefaultSquareDesktop
    ? "aspect-[4/3] lg:aspect-square"
    : "aspect-[4/3] lg:aspect-[1/1]";

  const activeSlide = slides[index];

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      data-owner-carousel
      data-thumbnail-carousel
      className={`w-full max-w-[560px] mx-auto select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-2xl lg:rounded-3xl ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setFocusWithin(false);
        }
      }}
      onKeyDown={onKeyDown}
    >
      {/* ── Main Viewport — Single Frame (§4.2) ───────────────────────────── */}
      <div
        ref={viewportRef}
        className={`relative overflow-hidden rounded-2xl lg:rounded-3xl border border-border-subtle bg-paper-100 shadow-lg ${aspectClass}`}
      >
        <motion.div
          className="flex h-full"
          style={{ x, opacity: stripOpacity }}
          drag={width ? "x" : false}
          dragConstraints={{ left: -(n - 1) * width, right: 0 }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragStart={() => setDragging(true)}
          onDragEnd={onDragEnd}
        >
          {slides.map((s, i) => {
            const slideAriaLabel = s.caption
              ? `${i + 1} of ${n}: ${s.caption.label} — ${s.caption.detail}`
              : `${i + 1} of ${n}`;

            return (
              <motion.div
                key={s.id}
                role="group"
                aria-roledescription="slide"
                aria-label={slideAriaLabel}
                aria-hidden={i !== index}
                className="relative h-full w-full shrink-0 overflow-hidden"
                animate={{ scale: reduce || i === index ? 1 : 0.94 }}
                transition={SPRING}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={
                    !reduce && i === index ? { scale: [1.04, 1] } : { scale: 1 }
                  }
                  transition={{ duration: intervalMs / 1000, ease: "linear" }}
                >
                  <SiteImage
                    id={s.id}
                    alt={s.alt}
                    fill
                    focal={s.focal}
                    badgePosition={effectiveBadgePosition}
                    sizes="(min-width: 1024px) 560px, 100vw"
                    priority={i === 0}
                    fetchPriority={i === 0 ? "high" : "low"}
                    loading={i === 0 ? undefined : "eager"}
                    draggable={false}
                    onDecoded={
                      i === 0
                        ? () => {
                            if (
                              typeof document !== "undefined" &&
                              document.readyState === "complete"
                            ) {
                              setReady(true);
                            } else if (typeof window !== "undefined") {
                              window.addEventListener("load", () => setReady(true), {
                                once: true,
                              });
                            } else {
                              setReady(true);
                            }
                          }
                        : undefined
                    }
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Feature Caption (bottom-left, §4.2) ─────────────────────────── */}
        {showCaption && activeSlide?.caption && (
          <div
            data-carousel-caption-container
            className="absolute bottom-4 left-4 z-20 pointer-events-none max-w-[88%] md:max-w-[78%]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                data-carousel-caption
                initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0, y: 0 } : { opacity: 0, y: 8 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        opacity: { duration: 0.3, delay: 0.2, ease: "easeOut" },
                        y: { duration: 0.3, delay: 0.2, ease: "easeOut" },
                      }
                }
                className="rounded-md bg-white/92 backdrop-blur-md px-3.5 py-2.5 shadow-md border border-border-subtle"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.92)" }}
              >
                <div
                  data-caption-label
                  className="font-sans text-label font-semibold uppercase tracking-wider text-red-700"
                  style={{ color: "var(--red-700, #B52D20)" }}
                >
                  {activeSlide.caption.label}
                </div>
                <div
                  data-caption-detail
                  className="font-sans text-body-sm text-ink-700 leading-snug mt-0.5"
                  style={{ color: "var(--ink-700, #342E28)" }}
                >
                  {activeSlide.caption.detail}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ── Controls Pill (bottom-right) ────────────────────────────────── */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 rounded-full bg-white/85 backdrop-blur-md px-2.5 py-1 text-label font-mono text-ink-700 shadow-sm border border-black/5">
          {!reduce && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-paper-200 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-600"
            >
              {userPaused ? (
                <Play className="h-3.5 w-3.5 fill-current text-ink-700" />
              ) : (
                <Pause className="h-3.5 w-3.5 fill-current text-ink-700" />
              )}
            </button>
          )}
          <span aria-live="off" className="tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ── Thumbnails Row with Progress Bar (§4.2) ────────────────────────── */}
      <div
        className="mt-4 flex justify-center gap-2"
        role="group"
        aria-label="Choose a photo"
      >
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <div key={s.id} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1} of ${n}: ${s.alt}`}
                aria-current={active ? "true" : undefined}
                className={`relative h-12 w-12 lg:h-14 lg:w-14 overflow-hidden rounded-md cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                  active
                    ? "opacity-100 scale-108 ring-2 ring-red-600 ring-offset-2 ring-offset-paper-50"
                    : "opacity-55 hover:opacity-85"
                }`}
              >
                <SiteImage
                  id={s.id}
                  alt=""
                  fill
                  sizes="56px"
                  focal={s.focal}
                  draggable={false}
                  thumbnail
                />
              </button>
              <div
                className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-paper-300"
                style={{ visibility: active && !reduce ? "visible" : "hidden" }}
              >
                <motion.div
                  className="h-full origin-left bg-red-600"
                  style={{ scaleX: active ? progressScale : 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
