/**
 * HeroAmbient -- full-bleed ambient photo background for the Hero section.
 *
 * Soft Reveal (REV-09 §3):
 * - Layered crossfade: incoming background on top at opacity 0 -> 1 over 1800ms.
 * - Outgoing layer stays solid at opacity 1 underneath until transition finishes.
 * - Starts 200ms after frame reveal begins so foreground leads and atmosphere follows.
 * - Pre-blurred WebP backgrounds (no runtime blur cost).
 */
"use client";

import { useRef, useEffect } from "react";
import { HERO_SLIDES } from "@/lib/hero-slides";

export interface HeroAmbientProps {
  current: number;
  reducedMotion?: boolean;
}

const AMBIENT_DURATION_MS = 1800;
const AMBIENT_DELAY_MS = 200;

export function HeroAmbient({ current, reducedMotion = false }: HeroAmbientProps) {
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const activeLayerRef = useRef<"a" | "b">("a");
  const prevIdxRef = useRef(-1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    // First mount: initialise layer A immediately (no transition)
    if (prevIdxRef.current === -1) {
      const slide = HERO_SLIDES[current] || HERO_SLIDES[0];
      a.style.backgroundImage = `url(${slide.bgSrc})`;
      a.style.opacity = "1";
      a.style.zIndex = "1";
      b.style.opacity = "0";
      b.style.zIndex = "0";
      activeLayerRef.current = "a";
      prevIdxRef.current = current;
      return;
    }

    if (prevIdxRef.current === current) return;

    const slide = HERO_SLIDES[current] || HERO_SLIDES[0];
    const dur = reducedMotion ? 250 : AMBIENT_DURATION_MS;
    const delay = reducedMotion ? 0 : AMBIENT_DELAY_MS;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (activeLayerRef.current === "a") {
      // Layer A is outgoing (z: 1, opacity: 1), Layer B is incoming (z: 2, opacity: 0 -> 1)
      b.style.backgroundImage = `url(${slide.bgSrc})`;
      b.style.transition = "none";
      b.style.opacity = "0";
      b.style.zIndex = "2";
      a.style.zIndex = "1";
      a.style.opacity = "1"; // held at 1 underneath
      void b.offsetHeight; // force reflow

      timeoutRef.current = setTimeout(() => {
        b.style.transition = `opacity ${dur}ms cubic-bezier(0.45, 0, 0.15, 1)`;
        b.style.opacity = "1";

        timeoutRef.current = setTimeout(() => {
          a.style.opacity = "0";
          a.style.zIndex = "0";
          activeLayerRef.current = "b";
        }, dur);
      }, delay);
    } else {
      // Layer B is outgoing (z: 1, opacity: 1), Layer A is incoming (z: 2, opacity: 0 -> 1)
      a.style.backgroundImage = `url(${slide.bgSrc})`;
      a.style.transition = "none";
      a.style.opacity = "0";
      a.style.zIndex = "2";
      b.style.zIndex = "1";
      b.style.opacity = "1"; // held at 1 underneath
      void a.offsetHeight;

      timeoutRef.current = setTimeout(() => {
        a.style.transition = `opacity ${dur}ms cubic-bezier(0.45, 0, 0.15, 1)`;
        a.style.opacity = "1";

        timeoutRef.current = setTimeout(() => {
          b.style.opacity = "0";
          b.style.zIndex = "0";
          activeLayerRef.current = "a";
        }, dur);
      }, delay);
    }

    prevIdxRef.current = current;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, reducedMotion]);

  const layer: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    willChange: "opacity",
  };

  return (
    <div
      data-hero-ambient
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
    >
      {/* Layer A */}
      <div ref={aRef} style={layer} />
      {/* Layer B */}
      <div ref={bRef} style={layer} />

      {/* Directional scrim: dark behind copy on left, near-clear on right around photo card, top header protection */}
      <div
        data-hero-scrim
        className="absolute inset-0"
      />

      {/* Micro-grain noise overlay */}
      <div
        data-hero-grain
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
      >
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="hero-grain-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-grain-filter)" />
        </svg>
      </div>
    </div>
  );
}

