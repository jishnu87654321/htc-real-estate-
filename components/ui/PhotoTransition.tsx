"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export interface PhotoItem {
  id: string;
  src: string;
  alt: string;
  focal?: { x: number; y: number };
  avgColor?: string;
  priority?: boolean;
}

export interface PhotoTransitionProps {
  currentSlide: PhotoItem;
  prevSlide?: PhotoItem;
  mode?: "hero" | "difference";
  direction?: number; // +1 for next/down, -1 for prev/up
  dwellMs?: number;
  revealMs?: number;
  revealEase?: string;
  enableSheen?: boolean;
  reducedMotion?: boolean;
  className?: string;
  sizes?: string;
  onTransitionEnd?: () => void;
}

// Module-level cache for weak device detection
let cachedFallback: boolean | null = null;

export function isCompositorFallback(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedFallback !== null) return cachedFallback;

  try {
    const isSaveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const concurrency = navigator.hardwareConcurrency;
    if (isSaveData || (typeof concurrency === "number" && concurrency <= 4)) {
      cachedFallback = true;
      return true;
    }
  } catch {
    // ignore
  }

  cachedFallback = false;
  return false;
}

export function setCompositorFallback(val: boolean) {
  cachedFallback = val;
}

export function PhotoTransition({
  currentSlide,
  prevSlide,
  mode = "hero",
  direction = 1,
  dwellMs = mode === "hero" ? 4500 : 8000,
  revealMs = mode === "hero" ? 1400 : 520,
  revealEase = mode === "hero"
    ? "cubic-bezier(0.45, 0, 0.15, 1)"
    : "cubic-bezier(0.25, 0.8, 0.3, 1)",
  enableSheen = mode === "hero",
  reducedMotion = false,
  className = "relative w-full h-full overflow-hidden rounded-3xl isolation-isolate",
  sizes = "(min-width: 1024px) 45vw, 100vw",
  onTransitionEnd,
}: PhotoTransitionProps) {
  const [transitionState, setTransitionState] = useState<{
    current: PhotoItem;
    prev: PhotoItem | null;
    isEntering: boolean;
  }>({
    current: currentSlide,
    prev: prevSlide || null,
    isEntering: false,
  });

  const [useFallback] = useState(() => (typeof window !== "undefined" ? isCompositorFallback() : false));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronously update transition state during render when currentSlide changes
  if (currentSlide.id !== transitionState.current.id) {
    setTransitionState({
      current: currentSlide,
      prev: prevSlide || transitionState.current,
      isEntering: true,
    });
  }

  const { current, prev: displayedPrev, isEntering } = transitionState;

  useEffect(() => {
    if (!isEntering) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const actualDuration = reducedMotion ? 250 : revealMs;

    timerRef.current = setTimeout(() => {
      setTransitionState((s) => ({
        ...s,
        isEntering: false,
      }));
      onTransitionEnd?.();
    }, actualDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current.id, isEntering, revealMs, reducedMotion, onTransitionEnd]);

  // Reveal Angle computation (§2.5)
  // Hero: 100deg right-to-left (+1), 280deg left-to-right (-1)
  // Difference: 0deg / "to top" when scrolling down (+1), 180deg / "to bottom" when scrolling up (-1)
  const revealAngle =
    mode === "hero"
      ? direction >= 0
        ? "100deg"
        : "280deg"
      : direction >= 0
      ? "to top"
      : "to bottom";

  const entryOffsetX = mode === "hero" ? (direction >= 0 ? 2 : -2) : 0;
  const entryOffsetY = 0;
  const exitDriftX = mode === "hero" ? (direction >= 0 ? -2 : 2) : 0;
  const exitDriftY = 0;

  const currentFocal = current.focal || { x: 0.5, y: 0.5 };
  const prevFocal = displayedPrev?.focal || { x: 0.5, y: 0.5 };

  return (
    <div
      data-photo-transition-container
      className={className}
      style={{
        isolation: "isolate",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes soft-reveal-hero-fwd {
          0% {
            -webkit-mask-position: 100% 0%;
            mask-position: 100% 0%;
            opacity: 0.35;
            transform: translate(2%, 0) scale(1.08);
          }
          100% {
            -webkit-mask-position: 0% 0%;
            mask-position: 0% 0%;
            opacity: 1;
            transform: translate(0%, 0) scale(1.04);
          }
        }
        @keyframes soft-reveal-hero-rev {
          0% {
            -webkit-mask-position: 0% 0%;
            mask-position: 0% 0%;
            opacity: 0.35;
            transform: translate(-2%, 0) scale(1.08);
          }
          100% {
            -webkit-mask-position: 100% 0%;
            mask-position: 100% 0%;
            opacity: 1;
            transform: translate(0%, 0) scale(1.04);
          }
        }
        @keyframes soft-reveal-diff-up {
          0% {
            -webkit-mask-position: 0% 100%;
            mask-position: 0% 100%;
            transform: translate(0, 0.75%) scale(1.01);
          }
          100% {
            -webkit-mask-position: 0% 0%;
            mask-position: 0% 0%;
            transform: translate(0, 0%) scale(1.0);
          }
        }
        @keyframes soft-reveal-diff-down {
          0% {
            -webkit-mask-position: 0% 0%;
            mask-position: 0% 0%;
            transform: translate(0, -0.75%) scale(1.01);
          }
          100% {
            -webkit-mask-position: 0% 100%;
            mask-position: 0% 100%;
            transform: translate(0, 0%) scale(1.0);
          }
        }
        @keyframes fallback-fade-hero-fwd {
          0% {
            opacity: 0.35;
            transform: translate(2%, 0) scale(1.08);
          }
          100% {
            opacity: 1;
            transform: translate(0%, 0) scale(1.04);
          }
        }
        @keyframes fallback-fade-hero-rev {
          0% {
            opacity: 0.35;
            transform: translate(-2%, 0) scale(1.08);
          }
          100% {
            opacity: 1;
            transform: translate(0%, 0) scale(1.04);
          }
        }
        @keyframes fallback-fade-diff-up {
          0% {
            opacity: 0;
            transform: translate(0, 0.75%) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translate(0, 0%) scale(1.0);
          }
        }
        @keyframes fallback-fade-diff-down {
          0% {
            opacity: 0;
            transform: translate(0, -0.75%) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translate(0, 0%) scale(1.0);
          }
        }
        @keyframes hero-sheen {
          0% {
            left: 100%;
            opacity: 0.18;
          }
          100% {
            left: -20%;
            opacity: 0;
          }
        }
        @keyframes color-tint-flash {
          0% { opacity: 0; }
          50% { opacity: 0.08; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* ── Layer 1: Outgoing (prev) — z: 1, solid opacity 1, never unmounts mid-transition ── */}
      {displayedPrev && (
        <div
          data-photo-layer="prev"
          className="absolute inset-0 h-full w-full pointer-events-none"
          style={{
            zIndex: 1,
            opacity: 1,
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              transform:
                mode === "hero" && isEntering && !reducedMotion
                  ? `translate(${exitDriftX}%, ${exitDriftY}%) scale(1.00)`
                  : "translate(0%, 0%) scale(1.0)",
              transition:
                mode === "hero" && isEntering && !reducedMotion
                  ? `transform ${revealMs}ms ${revealEase}`
                  : `transform ${dwellMs}ms linear`,
            }}
          >
            <Image
              src={displayedPrev.src}
              alt={displayedPrev.alt}
              fill
              sizes={sizes}
              priority={displayedPrev.priority}
              className="object-cover"
              style={{
                objectPosition: `${prevFocal.x * 100}% ${prevFocal.y * 100}%`,
              }}
            />

            {/* Darken overlay on outgoing layer (hero only) */}
            {mode === "hero" && (
              <div
                className="absolute inset-0 bg-[#17140f] transition-opacity pointer-events-none"
                style={{
                  opacity: isEntering && !reducedMotion ? 0.18 : 0,
                  transitionDuration: `${revealMs}ms`,
                  transitionTimingFunction: "linear",
                }}
              />
            )}

            {/* Colour continuity overlay (§2.8: outgoing tinted with incoming avgColor) */}
            {mode === "hero" && isEntering && current.avgColor && !reducedMotion && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: current.avgColor,
                  animation: `color-tint-flash ${revealMs}ms ease-in-out forwards`,
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Layer 2: Incoming (current) — z: 2, soft reveal mask or fallback fade ── */}
      <div
        key={current.id}
        data-photo-layer="current"
        data-entering={isEntering ? "true" : "false"}
        className={`absolute inset-0 h-full w-full ${isEntering ? "is-entering" : ""}`}
        style={{
          zIndex: 2,
          willChange: isEntering ? "transform, opacity, mask-position" : "auto",
          ...(isEntering
            ? reducedMotion
              ? {
                  opacity: 1,
                  transition: "opacity 250ms ease-out",
                }
              : useFallback
              ? {
                  opacity: 1,
                  animation:
                    mode === "hero"
                      ? direction >= 0
                        ? `fallback-fade-hero-fwd ${revealMs}ms ${revealEase} forwards`
                        : `fallback-fade-hero-rev ${revealMs}ms ${revealEase} forwards`
                      : direction >= 0
                      ? `fallback-fade-diff-up ${revealMs}ms ${revealEase} forwards`
                      : `fallback-fade-diff-down ${revealMs}ms ${revealEase} forwards`,
                }
              : {
                  WebkitMaskImage:
                    mode === "hero"
                      ? `linear-gradient(${revealAngle}, black 0%, black 40%, transparent 60%, transparent 100%)`
                      : `linear-gradient(${revealAngle}, black 0%, black 50%, transparent 95%, transparent 100%)`,
                  maskImage:
                    mode === "hero"
                      ? `linear-gradient(${revealAngle}, black 0%, black 40%, transparent 60%, transparent 100%)`
                      : `linear-gradient(${revealAngle}, black 0%, black 50%, transparent 95%, transparent 100%)`,
                  WebkitMaskSize: mode === "hero" ? "250% 100%" : "100% 220%",
                  maskSize: mode === "hero" ? "250% 100%" : "100% 220%",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  animation:
                    mode === "hero"
                      ? direction >= 0
                        ? `soft-reveal-hero-fwd ${revealMs}ms ${revealEase} forwards`
                        : `soft-reveal-hero-rev ${revealMs}ms ${revealEase} forwards`
                      : direction >= 0
                      ? `soft-reveal-diff-up ${revealMs}ms ${revealEase} forwards`
                      : `soft-reveal-diff-down ${revealMs}ms ${revealEase} forwards`,
                }
            : {
                opacity: 1,
                WebkitMaskImage: "none",
                maskImage: "none",
              }),
        }}
      >
        <div className="relative h-full w-full">
          <Image
            src={current.src}
            alt={current.alt}
            fill
            sizes={sizes}
            priority={current.priority}
            className="object-cover"
            style={{
              objectPosition: `${currentFocal.x * 100}% ${currentFocal.y * 100}%`,
            }}
          />

          {/* Sheen effect (Hero only, §2.6) */}
          {enableSheen && isEntering && !reducedMotion && !useFallback && (
            <div
              className="pointer-events-none absolute inset-y-0 w-[20%] z-30"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%)",
                animation: `hero-sheen ${revealMs}ms ${revealEase} forwards`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
