"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/lib/motion";

export function SmoothLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing verified network...");
  const [navigating, setNavigating] = useState(false);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  // Initial luxury splash loader
  useEffect(() => {
    // If reduced motion is preferred, close immediately via timer
    if (reducedMotion) {
      const exitTimer = setTimeout(() => {
        setLoading(false);
      }, 0);
      return () => clearTimeout(exitTimer);
    }

    const startTime = Date.now();
    const targetDuration = 1000; // 1s smooth load time

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentRatio = Math.min(elapsed / targetDuration, 1);
      
      // Smooth ease-out progress curve
      const easedProgress = Math.round((1 - Math.pow(1 - currentRatio, 3)) * 100);
      setProgress(easedProgress);

      if (easedProgress < 40) {
        setStatusText("Connecting to managed communities...");
      } else if (easedProgress < 85) {
        setStatusText("Loading verified listings & sequence models...");
      } else {
        setStatusText("Welcome to HTC");
      }

      if (currentRatio >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
        }, 160);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  // Route transition micro-progress indicator
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setNavigating(true);
    }, 0);
    const endTimer = setTimeout(() => {
      setNavigating(false);
    }, 350);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [pathname]);

  return (
    <>
      {/* Route Navigation Top Bar */}
      <AnimatePresence>
        {navigating && (
          <motion.div
            key="route-progress"
            className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-red-600 origin-left"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 0.85, opacity: 1 }}
            exit={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Main Luxury Splash Loader */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="htc-splash-loader"
            role="status"
            aria-live="polite"
            aria-label="Loading HTC Real Estate"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-paper-50 text-ink-900 select-none overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{
              y: "-100%",
              transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
            }}
          >
            {/* Subtle background ambient warm glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,45,32,0.06)_0%,rgba(253,252,251,0)_70%)]" />

            <div className="relative flex flex-col items-center max-w-sm px-6 text-center">
              {/* Brand Monogram */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mb-2"
              >
                <span className="font-serif text-5xl font-bold tracking-widest text-ink-900 italic">
                  HTC
                </span>
              </motion.div>

              {/* Sub-label */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] text-red-700 uppercase"
              >
                Hyderabad Township Communities
              </motion.p>

              {/* Minimalist Progress Meter */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="mt-8 w-48 sm:w-56"
              >
                <div className="h-[2.5px] w-full overflow-hidden rounded-full bg-paper-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-600 to-red-500"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>

                {/* Progress Details */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-ink-400">
                  <span className="truncate pr-2">{statusText}</span>
                  <span className="font-mono text-ink-900 font-semibold">{progress}%</span>
                </div>
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="mt-8 text-[11px] text-ink-400"
              >
                Managed communities · Direct listings · Zero brokerage
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
