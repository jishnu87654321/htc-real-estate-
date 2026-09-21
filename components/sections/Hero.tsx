"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { useReducedMotion } from "@/lib/motion";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { HeroAmbient } from "@/components/sections/hero/HeroAmbient";
import { RotatingLine } from "@/components/sections/hero/RotatingLine";
import { HeroCarousel } from "@/components/sections/hero/HeroCarousel";

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
  const frameScale = useTransform(heroExitProgress, [0, 1], [1, 0.88], { clamp: true });
  const frameY = useTransform(heroExitProgress, [0, 1], [0, 80], { clamp: true });
  const frameOpacity = useTransform(heroExitProgress, [0, 1], [1, 0.35], { clamp: true });

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

  // Single unified hero slides driver (§A1)
  const slides = useHeroSlides({
    dwell: 4000,
    reducedMotion,
    isHovered,
    isFocused,
    isVisible: isHeroVisible && !recedePaused,
  });

  return (
    <section
      ref={heroRef}
      data-hero
      className="relative isolate overflow-clip min-h-[calc(100svh-var(--header-h,80px))] max-h-[960px] flex flex-col justify-center pt-8 pb-16 md:pt-12 md:pb-24"
    >
      {/* Layer 0: Full-bleed ambient background (REV-11 §4.1) */}
      <HeroAmbient current={slides.current} reducedMotion={reducedMotion} />

      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 my-auto">
        {/* Copy Column (Left) */}
        <motion.div
          style={reducedMotion ? {} : { y: copyY, opacity: copyOpacity }}
          className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1"
        >
          {/* Static Verbatim H1 (REV-11 §4.3: High contrast white with soft halo) */}
          <h1 className="max-w-xl font-serif text-display-xl leading-[1.02] tracking-[-0.02em] text-white [text-shadow:0_2px_24px_rgba(23,20,15,0.45)]">
            Homes from the people who run the building.
          </h1>

          {/* Rotating Supporting Line & Tag (REV-11 §4.3 & §4.4) */}
          <RotatingLine current={slides.current} reducedMotion={reducedMotion} />

          {/* CTAs (REV-11 §3.2) */}
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

          {/* Supporting reassurance line (REV-11 §3.3) */}
          <p className="mt-4 font-sans text-body-sm text-white/75">
            No brokerage. No fee to contact an owner.
          </p>

          {/* Scroll Cue (White on dark photographic hero) */}
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

        {/* Carousel Frame Column (Right) */}
        <div
          className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <motion.div
            data-hero-frame
            style={
              reducedMotion
                ? {}
                : {
                    scale: frameScale,
                    y: frameY,
                    opacity: frameOpacity,
                  }
            }
            className="w-full origin-center"
          >
            <HeroCarousel
              current={slides.current}
              prev={slides.prev}
              progress={slides.progress}
              isPaused={slides.isPaused}
              isManualPaused={slides.isManualPaused}
              togglePause={slides.togglePause}
              goTo={slides.goTo}
              next={slides.next}
              prevSlide={slides.prevSlide}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
