"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HERO_SLIDES, type HeroSlide } from "@/lib/hero-slides";

export interface UseHeroSlidesProps {
  dwell?: number; // default 4000ms
  reducedMotion?: boolean;
  isHovered?: boolean;
  isFocused?: boolean;
  isVisible?: boolean;
}

export interface UseHeroSlidesReturn {
  current: number;
  prev: number;
  slide: HeroSlide;
  slides: HeroSlide[];
  isPaused: boolean;
  isManualPaused: boolean;
  progress: number;
  togglePause: () => void;
  goTo: (index: number) => void;
  next: () => void;
  prevSlide: () => void;
}

export function useHeroSlides({
  dwell = 4000,
  reducedMotion = false,
  isHovered = false,
  isFocused = false,
  isVisible = true,
}: UseHeroSlidesProps = {}): UseHeroSlidesReturn {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(0);
  const [isManualPaused, setIsManualPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Time remaining in current dwell
  const remainingTimeRef = useRef(dwell);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isPaused = reducedMotion || isManualPaused || isHovered || isFocused || !isVisible;

  const prefetchNext = useCallback((nextIdx: number) => {
    if (typeof window === "undefined") return Promise.resolve();
    const nextImageSrc = HERO_SLIDES[nextIdx]?.image;
    if (!nextImageSrc) return Promise.resolve();
    const img = new Image();
    img.src = nextImageSrc;
    if (img.decode) {
      return img.decode().catch(() => {});
    }
    return Promise.resolve();
  }, []);

  const advanceSlide = useCallback(
    async (targetIdx?: number) => {
      const nextIdx = targetIdx !== undefined ? targetIdx : (current + 1) % HERO_SLIDES.length;
      await prefetchNext(nextIdx);
      setPrev(current);
      setCurrent(nextIdx);
      remainingTimeRef.current = dwell;
      startTimeRef.current = performance.now();
      setProgress(0);
    },
    [current, dwell, prefetchNext]
  );

  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;
      advanceSlide(index);
    },
    [current, advanceSlide]
  );

  const next = useCallback(() => {
    advanceSlide((current + 1) % HERO_SLIDES.length);
  }, [current, advanceSlide]);

  const prevSlide = useCallback(() => {
    advanceSlide((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, [current, advanceSlide]);

  const togglePause = useCallback(() => {
    setIsManualPaused((p) => !p);
  }, []);

  // Timer loop with smooth progress tracking
  useEffect(() => {
    if (isPaused) {
      if (startTimeRef.current !== null) {
        const elapsed = performance.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
        startTimeRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    startTimeRef.current = performance.now();

    const loop = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsedSinceResume = time - startTimeRef.current;
      const totalElapsed = (dwell - remainingTimeRef.current) + elapsedSinceResume;
      const currentProgress = Math.min(Math.max(totalElapsed / dwell, 0), 1);
      setProgress(currentProgress);

      if (elapsedSinceResume >= remainingTimeRef.current) {
        advanceSlide();
      } else {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, current, dwell, advanceSlide]);

  return {
    current,
    prev,
    slide: HERO_SLIDES[current],
    slides: HERO_SLIDES,
    isPaused,
    isManualPaused,
    progress,
    togglePause,
    goTo,
    next,
    prevSlide,
  };
}
