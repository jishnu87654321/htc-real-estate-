/**
 * HeroCarousel -- full-frame photo carousel (right column of Hero).
 *
 * Soft Reveal (REV-09):
 * - Driven by shared PhotoTransition system.
 * - Layered reveal: outgoing layer stays opaque (opacity: 1) underneath.
 * - Continuous scale and offset drift across 1400ms duration.
 * - Focal alignment and subtle sheen.
 */
"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { HERO_SLIDES } from "@/lib/hero-slides";
import { PhotoTransition, type PhotoItem } from "@/components/ui/PhotoTransition";

export interface HeroCarouselProps {
  current: number;
  prev: number;
  progress: number;
  isPaused: boolean;
  isManualPaused: boolean;
  togglePause: () => void;
  goTo: (index: number) => void;
  next: () => void;
  prevSlide: () => void;
  reducedMotion?: boolean;
}

export function HeroCarousel({
  current,
  prev,
  progress,
  isPaused,
  isManualPaused,
  togglePause,
  goTo,
  next,
  prevSlide,
  reducedMotion = false,
}: HeroCarouselProps) {
  const currentSlide = HERO_SLIDES[current] || HERO_SLIDES[0];
  const prevSlideObj = HERO_SLIDES[prev] || HERO_SLIDES[0];

  // Direction: +1 for next/forward, -1 for backward
  let direction = 1;
  if (current === 0 && prev === HERO_SLIDES.length - 1) {
    direction = 1;
  } else if (current === HERO_SLIDES.length - 1 && prev === 0) {
    direction = -1;
  } else {
    direction = current >= prev ? 1 : -1;
  }

  const currentItem: PhotoItem = {
    id: currentSlide.id,
    src: currentSlide.image,
    alt: currentSlide.alt,
    focal: currentSlide.focal,
    avgColor: currentSlide.avgColor,
    priority: current === 0,
  };

  const prevItem: PhotoItem = {
    id: prevSlideObj.id,
    src: prevSlideObj.image,
    alt: prevSlideObj.alt,
    focal: prevSlideObj.focal,
    avgColor: prevSlideObj.avgColor,
  };

  // Touch swipe (40px threshold)
  const touchStartXRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 40) next();
    else if (diff < -40) prevSlide();
    touchStartXRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prevSlide();
  };

  return (
    <div
      data-hero-carousel
      tabIndex={0}
      role="region"
      aria-label="HTC featured communities carousel"
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex flex-col items-center justify-center w-full max-w-md lg:max-w-lg mx-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-3xl"
    >
      {/* Frame: 4/3 on mobile, 4/5 on desktop (REV-11 §4.6 & §5) */}
      <div className="relative w-full aspect-[4/3] md:aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.28)] ring-1 ring-white/35 bg-paper-100">
        <PhotoTransition
          currentSlide={currentItem}
          prevSlide={prevItem}
          mode="hero"
          direction={direction}
          revealMs={1400}
          revealEase="cubic-bezier(0.45, 0, 0.15, 1)"
          enableSheen={true}
          reducedMotion={reducedMotion}
          className="absolute inset-0 h-full w-full"
          sizes="(min-width: 1024px) 45vw, 100vw"
        />

        {/* Counter badge */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center rounded-full bg-ink-900/75 backdrop-blur-md px-3.5 py-1 text-label font-mono text-white shadow-md">
          <span>{String(current + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}</span>
        </div>

        {/* Pause / Play button (WCAG 2.2.2) */}
        <button
          type="button"
          aria-label={isManualPaused ? "Play slideshow" : "Pause slideshow"}
          onClick={togglePause}
          className="absolute bottom-4 left-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-ink-900/75 backdrop-blur-md text-white shadow-md hover:bg-ink-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
        >
          {isManualPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>

        {/* Vertical red rail indicator */}
        <div className="absolute top-4 right-4 bottom-16 w-1 rounded-full bg-white/25 overflow-hidden z-20">
          <motion.div
            animate={{
              top: `${(current / HERO_SLIDES.length) * 100}%`,
              height: `${100 / HERO_SLIDES.length}%`,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute left-0 right-0 rounded-full bg-red-600"
          />
        </div>
      </div>

      {/* Segmented progress bars */}
      <div className="mt-5 flex w-full items-center justify-between gap-3 px-2">
        {HERO_SLIDES.map((slideItem, idx) => {
          const isCurrent = current === idx;
          const isPast = current > idx;
          return (
            <button
              key={slideItem.id}
              type="button"
              aria-label={`Jump to slide ${idx + 1}`}
              onClick={() => goTo(idx)}
              className="group relative h-2 flex-1 rounded-full bg-paper-300 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              {isCurrent ? (
                <div
                  className="h-full w-full bg-red-600 origin-left"
                  style={{
                    transform: reducedMotion ? "scaleX(1)" : `scaleX(${progress})`,
                    transition: reducedMotion ? "none" : "transform 50ms linear",
                  }}
                />
              ) : isPast ? (
                <div className="h-full w-full bg-red-600/70" />
              ) : (
                <div className="h-full w-full bg-transparent group-hover:bg-paper-400 transition-colors" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

