"use client";

import { motion, AnimatePresence } from "motion/react";
import { HERO_SLIDES } from "@/lib/hero-slides";

export interface RotatingLineProps {
  current: number;
  reducedMotion?: boolean;
}

export function RotatingLine({ current, reducedMotion = false }: RotatingLineProps) {
  const currentSlide = HERO_SLIDES[current] || HERO_SLIDES[0];
  const words = currentSlide.line.split(" ");

  return (
    <div
      data-rotating-line-container
      className="mt-6 flex flex-col justify-start h-[120px] sm:h-[96px] lg:h-[108px] overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlide.id}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, transition: { duration: 0.35 } }}
          className="flex flex-col"
        >
          {/* Tag above rotating line (REV-11 §4.3) */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.35, delay: 0.3 }}
            className="mb-2"
          >
            <span
              data-rotating-line-tag
              className="font-sans text-label font-semibold uppercase tracking-widest text-red-400"
              style={{ color: "var(--red-400, #E05A4A)" }}
            >
              {currentSlide.tag}
            </span>
          </motion.div>

          {/* Rotating line text with word split stagger (REV-11 §4.3 & §4.4) */}
          <p
            data-rotating-line
            className="max-w-[52ch] text-body-lg font-normal text-white/90 leading-relaxed [text-shadow:0_1px_12px_rgba(23,20,15,0.35)]"
          >
            {reducedMotion ? (
              currentSlide.line
            ) : (
              words.map((word, wIdx) => (
                <motion.span
                  key={`${currentSlide.id}-word-${wIdx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.35 + wIdx * 0.022,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                  className="inline-block mr-[0.28em] last:mr-0"
                >
                  {word}
                </motion.span>
              ))
            )}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
