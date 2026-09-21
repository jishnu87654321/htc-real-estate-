/**
 * useResponsivePlaceholder
 *
 * REV-06 C-01 fix: measures the actual input element width (inputRef) and
 * picks the longest string whose rendered pixel-width fits in the input.
 * Falls back to breakpoint-based media query strings when no ref is attached.
 */
"use client";

import { useState, useEffect, useRef, RefObject } from "react";

const CANDIDATES = [
  "Search a locality, community or landmark", // ~39ch -- longest
  "Locality, community or landmark",           // ~31ch
  "Locality or community",                     // ~21ch
  "Search",                                    // ~6ch  -- never clips
] as const;

/** Measure rendered pixel width of a string in the current font */
function measureText(text: string, el: HTMLElement): number {
  const style = window.getComputedStyle(el);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return Infinity;
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  return ctx.measureText(text).width;
}

/**
 * @param inputRef  Optional ref to the search <input> element.
 *                  If provided, the hook measures actual available width.
 */
export function useResponsivePlaceholder(
  inputRef?: RefObject<HTMLInputElement | null>
): string {
  const [placeholder, setPlaceholder] = useState<string>(CANDIDATES[0]);
  // Internal ref so we can also use this hook without an external ref
  const internalRef = useRef<HTMLInputElement | null>(null);
  const resolvedRef = inputRef ?? internalRef;

  useEffect(() => {
    function update() {
      const el = resolvedRef.current;
      if (!el) {
        // Fallback: breakpoint-based
        if (window.matchMedia("(min-width: 1280px)").matches) {
          setPlaceholder(CANDIDATES[0]);
        } else if (window.matchMedia("(min-width: 400px)").matches) {
          setPlaceholder(CANDIDATES[1]);
        } else {
          setPlaceholder(CANDIDATES[2]);
        }
        return;
      }

      // Available width = input scrollWidth (this is the inner text area width)
      // We subtract a small padding so the text never exactly butts the edge.
      const available = el.clientWidth - 8;
      let chosen = CANDIDATES[CANDIDATES.length - 1];
      for (const candidate of CANDIDATES) {
        if (measureText(candidate, el) <= available) {
          chosen = candidate;
          break;
        }
      }
      setPlaceholder(chosen);
    }

    update();

    const ro = new ResizeObserver(update);
    if (resolvedRef.current) ro.observe(resolvedRef.current);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return placeholder;
}
