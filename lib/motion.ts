"use client";

import { useEffect, useLayoutEffect, useState } from "react";

// useLayoutEffect warns when it runs during SSR; Next.js SSRs client
// components too, so fall back to useEffect there (its no-op on the server
// is fine — the corrected value still lands before paint on the client
// because layout effects flush synchronously before the browser paints).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const duration = {
  fast: 0.15, // hover, focus, small state changes
  base: 0.25, // card transitions, accordions
  slow: 0.4, // modals, page transitions
  scene: 1.2, // count-ups, scroll sequence beats
} as const;

export const ease = {
  out: [0.16, 1, 0.3, 1] as const, // entrances — the default
  inOut: [0.65, 0, 0.35, 1] as const, // state-to-state movement
  spring: { type: "spring", stiffness: 260, damping: 30, mass: 0.8 } as const,
} as const;

export const stagger = { tight: 0.05, base: 0.08, loose: 0.12 } as const;

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Subscribes to prefers-reduced-motion so components re-render if the user
 * flips the OS setting mid-session, not just on first mount.
 *
 * The initial state is always `false` — matching what the server rendered —
 * even though the real value is knowable synchronously on the client. This
 * is deliberate: computing the real value in the initial `useState` would
 * make the very first client render (during hydration) differ from the SSR
 * HTML, and React does not reliably patch a `style`-attribute mismatch found
 * during hydration ("this won't be patched up" in its own hydration warning)
 * — for reduced-motion users that left whole sections permanently stuck at
 * `opacity: 0`. Deferring the real value to a layout effect means it lands
 * as a normal post-hydration state update instead, which React re-renders
 * correctly, and `useLayoutEffect` (vs. `useEffect`) applies it before the
 * browser paints so there's no visible flash either.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Composes the {initial, whileInView/animate, viewport, transition} props
 * for a bespoke `motion.*` element that needs more control than <Reveal>
 * gives (custom stagger math, mixed transforms, etc.).
 *
 * Why this exists rather than each component writing its own
 * `reducedMotion ? undefined : {...}` ternary: `initial` is only read once,
 * at mount. Because `useReducedMotion()` necessarily starts at `false` (see
 * its own comment) and only corrects itself a moment after hydration, a
 * component that mounted with a hidden `initial` and then simply swaps
 * `whileInView` to `undefined` once reducedMotion turns true is left with
 * nothing driving it to the visible state — it stays stuck at `opacity: 0`
 * forever. Setting `animate` to the settled values instead (which DOES
 * re-run on every prop change, unlike `initial`) actually moves it there.
 */
export function useRevealMotion<T extends Record<string, unknown>>({
  hidden,
  visible,
  transition,
  viewport = { once: true, amount: 0.3 },
}: {
  hidden: T;
  visible: T;
  transition?: Record<string, unknown>;
  viewport?: { once?: boolean; amount?: number };
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return { initial: false as const, animate: visible, transition: { duration: 0 } };
  }

  return { initial: hidden, whileInView: visible, viewport, transition };
}
