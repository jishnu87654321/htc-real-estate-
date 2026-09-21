"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { useReducedMotion } from "@/lib/motion";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { HERO_SLIDES } from "@/lib/hero-slides";
import { RotatingLine } from "@/components/sections/hero/RotatingLine";
import { PhotoTransition, type PhotoItem } from "@/components/ui/PhotoTransition";

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  // Recede scroll driver (§A3)
  const { scrollY } = useScroll();
  const heroExitProgress = useTransform(scrollY, (y) => {
    const h = heroRef.current?.offsetHeight || 850;
    return Math.min(Math.max(y / h, 0), 1);
  });

  const isRecedePastHalf = useTransform(heroExitProgress, (p) => p > 0.5);
  const [recedePaused, setRecedePaused] = useState(false);

  useEffect(() => {
    return isRecedePastHalf.on("change", (latest) => {
      setRecedePaused(latest);
    });
  }, [isRecedePastHalf]);

  // Differential parallax transforms
  const copyY = useTransform(heroExitProgress, [0, 1], [0, -60], { clamp: true });
  const copyOpacity = useTransform(heroExitProgress, [0, 0.8], [1, 0], { clamp: true });

  // Scroll cue opacity (fades out by 15% progress)
  const cueOpacity = useTransform(heroExitProgress, [0, 0.15], [1, 0], { clamp: true });

  // Visibility threshold observer (>= 40% visible)
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.intersectionRatio >= 0.4);
      },
      { threshold: [0, 0.4, 1] }
    );
    observer.observe(el);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsHeroVisible(false);
      } else {
        const rect = el.getBoundingClientRect();
        setIsHeroVisible(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Single unified hero slides driver
  const slides = useHeroSlides({
    dwell: 4000,
    reducedMotion,
    isHovered,
    isFocused,
    isVisible: isHeroVisible && !recedePaused,
  });

  // Calculate direction for continuous Ken Burns and directional transitions
  let direction = 1;
  if (slides.current === 0 && slides.prev === HERO_SLIDES.length - 1) {
    direction = 1;
  } else if (slides.current === HERO_SLIDES.length - 1 && slides.prev === 0) {
    direction = -1;
  } else {
    direction = slides.current >= slides.prev ? 1 : -1;
  }

  const currentSlide = HERO_SLIDES[slides.current] || HERO_SLIDES[0];
  const prevSlideObj = HERO_SLIDES[slides.prev] || HERO_SLIDES[0];

  const currentItem: PhotoItem = {
    id: currentSlide.id,
    src: currentSlide.image,
    alt: currentSlide.alt,
    focal: currentSlide.focal,
    avgColor: currentSlide.avgColor,
    priority: slides.current === 0,
  };

  const prevItem: PhotoItem = {
    id: prevSlideObj.id,
    src: prevSlideObj.image,
    alt: prevSlideObj.alt,
    focal: prevSlideObj.focal,
    avgColor: prevSlideObj.avgColor,
  };

  return (
    <section
      ref={heroRef}
      data-hero
      aria-label="Featured community, rotating every few seconds — hover or focus to pause"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
      className="relative isolate overflow-clip min-h-[calc(100svh-var(--header-h,80px))] max-h-[960px] flex flex-col justify-center pt-8 pb-16 md:pt-12 md:pb-24"
    >
      {/* Layer 0: One full-bleed sharp photo layer (REV-16 §4) */}
      <div
        data-hero-photo
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ borderRadius: "0px", boxShadow: "none" }}
      >
        <PhotoTransition
          currentSlide={currentItem}
          prevSlide={prevItem}
          mode="hero"
          direction={direction}
          revealMs={1400}
          revealEase="cubic-bezier(0.45, 0, 0.15, 1)"
          enableSheen={true}
          reducedMotion={reducedMotion}
          className="w-full h-full"
          sizes="100vw"
        />
      </div>

      {/* Layer 1: Directional Scrim (REV-16 §5) */}
      <div data-hero-scrim className="absolute inset-0 z-[1] pointer-events-none" />

      {/* Layer 2: Vignette (REV-16 §5.3) */}
      <div data-hero-vignette className="absolute inset-0 z-[2] pointer-events-none" />

      {/* Layer 3: Copy Column Overlay (REV-16 §8) */}
      <Container className="relative z-[3] my-auto w-full">
        <motion.div
          style={reducedMotion ? {} : { y: copyY, opacity: copyOpacity }}
          className="max-w-xl lg:max-w-2xl flex flex-col justify-center text-left"
        >
          {/* Static Verbatim H1 (REV-16 §0, §5.2) */}
          <h1 className="font-serif text-display-xl leading-[1.02] tracking-[-0.02em] text-white [text-shadow:0_2px_24px_rgba(23,20,15,0.45)]">
            Homes from the people who run the building.
          </h1>

          {/* Rotating Supporting Line & Tag (REV-16 §0 #3) */}
          <RotatingLine current={slides.current} reducedMotion={reducedMotion} />

          {/* CTAs (REV-16 §0 #6) */}
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/properties"
              className="inline-flex h-[52px] items-center justify-center rounded-full bg-red-600 px-7 font-sans text-body-md font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-500 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-3 focus-visible:ring-offset-transparent cursor-pointer"
            >
              Find a home
            </Link>

            <Link
              href="/list-your-property"
              className="inline-flex h-[52px] items-center justify-center rounded-full border-[1.5px] border-white/70 bg-transparent px-7 font-sans text-body-md font-semibold text-white transition-all duration-200 hover:border-white hover:bg-white/12 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-3 focus-visible:ring-offset-transparent cursor-pointer"
            >
              List your property
            </Link>
          </div>

          {/* Supporting reassurance line */}
          <p className="mt-4 font-sans text-body-sm text-white/75">
            No brokerage. No fee to contact an owner.
          </p>

          {/* Scroll Cue */}
          <motion.div
            data-scroll-cue
            style={reducedMotion ? {} : { opacity: cueOpacity }}
            className="hidden sm:flex items-center gap-2 mt-8 text-label text-white/60"
          >
            <span>Scroll</span>
            <div className="relative h-6 w-[1.5px] bg-white/20 overflow-hidden rounded-full">
              {reducedMotion ? (
                <div className="h-full w-full bg-red-400" />
              ) : (
                <motion.div
                  animate={{ y: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="h-full w-full bg-red-400 origin-top"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Layer 3: Bottom Progress Bars & Counter Indicator (REV-16 §7) */}
      <div
        data-hero-indicator
        className="absolute bottom-6 inset-x-0 z-[3] flex flex-col items-center gap-2.5 pointer-events-auto"
      >
        {/* Segmented progress bars with jump buttons */}
        <div className="flex items-center justify-center gap-2 max-w-xs w-full px-4">
          {HERO_SLIDES.map((slideItem, idx) => {
            const isCurrent = slides.current === idx;
            const isPast = slides.current > idx;
            return (
              <button
                key={slideItem.id}
                type="button"
                aria-label={`Jump to slide ${idx + 1}`}
                onClick={() => slides.goTo(idx)}
                className="group relative h-1.5 flex-1 rounded-full bg-white/25 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {isCurrent ? (
                  <div
                    className="h-full w-full bg-red-500 origin-left"
                    style={{
                      transform: reducedMotion ? "scaleX(1)" : `scaleX(${slides.progress})`,
                      transition: reducedMotion ? "none" : "transform 50ms linear",
                    }}
                  />
                ) : isPast ? (
                  <div className="h-full w-full bg-red-500/70" />
                ) : (
                  <div className="h-full w-full bg-transparent group-hover:bg-white/20 transition-colors" />
                )}
              </button>
            );
          })}
        </div>

        {/* Slide Counter Pill */}
        <div className="flex items-center rounded-full bg-ink-900/60 backdrop-blur-md px-3 py-0.5 text-label font-mono text-white/90 shadow-sm ring-1 ring-white/10 tabular-nums">
          <span>{String(slides.current + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}
