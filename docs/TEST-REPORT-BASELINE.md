# HTC Front-End Test Report — Phase 1: Baseline

**Date:** 2026-09-21  
**Target:** HTC Front-End Production Build (`next build` + `next start`)  
**Status:** **PASSED (537/537 tests passing, 0 critical defects)**

---

## 1. Executive Summary

Phase 1 Baseline testing was executed across all 10 routes and all 10 test suites covering SSR, content fidelity, responsive layout (8 viewports), interactive elements, single-owner motion systems, WCAG 2.1 AA accessibility, Web Vitals performance, visual regression baselines, SEO/JSON-LD, and image integrity.

All 537 automated tests passed on Desktop Chrome (1440×900), Mobile Chrome (390×844), and Tablet Chrome (768×1024).

| Suite | Tests | Result | Status |
|---|---|---|---|
| **Suite 1: SSR & Rendering** (`ssr.spec.ts`) | 57 | 57 passed | ✅ Green |
| **Suite 2: Content Fidelity** (`content.spec.ts`) | 54 | 54 passed | ✅ Green |
| **Suite 3: Layout & Overflow** (`layout.spec.ts`) | 126 | 126 passed | ✅ Green |
| **Suite 4: Interaction** (`interaction.spec.ts`) | 36 | 36 passed | ✅ Green |
| **Suite 5: Animation Stability** (`animation.spec.ts` + related) | 108 | 108 passed | ✅ Green |
| **Suite 6: Accessibility WCAG AA** (`a11y.spec.ts`) | 60 | 60 passed | ✅ Green |
| **Suite 7: Performance & Vitals** (`perf.spec.ts`) | 18 | 18 passed | ✅ Green |
| **Suite 8: Visual Regression** (`visual.spec.ts`) | 18 | 18 passed | ✅ Green |
| **Suite 9: SEO & Metadata** (`seo.spec.ts`) | 42 | 42 passed | ✅ Green |
| **Suite 10: Image Integrity** (`images.spec.ts`) | 18 | 18 passed | ✅ Green |
| **Total** | **537** | **537 passed (100%)** | **PASSED** |

---

## 2. Baseline Defect Register & Resolutions

| Defect ID | Suite / Route | Severity | Symptom / Root Cause | Resolution | Status |
|---|---|---|---|---|---|
| **DEF-01** | Suite 1 (`/`) | S1 (High) | Browser console warning: `<circle> attribute cx: Expected length, "undefined"` emitted on initial render before dimensions evaluated in `Coverage.tsx` and `CommsGraph.tsx`. | Replaced dynamic keyframe arrays on SVG motion elements with static coordinates + rotating SVG groups. Added default `cx={0} cy={0}` to city ping circles. | **FIXED & RE-VERIFIED** |
| **DEF-02** | Suite 10 (Site-wide) | S2 (Medium) | Image integrity spec was testing unrendered offscreen elements before load state settled. | Added explicit load settlement and complete-state assertions. | **FIXED & RE-VERIFIED** |

---

## 3. Core Web Vitals & Performance Baseline

| Route | LCP Element | LCP Time (Baseline) | CLS | TBT | Initial Transfer Size |
|---|---|---|---|---|---|
| `/` (Homepage) | `<h1>` ("Homes from the people who run the building") | 1.12s | 0.000 | < 50ms | ~142 KB (without photos) |
| `/properties` | `<h1>` ("Direct from building managers") | 0.88s | 0.000 | < 40ms | ~118 KB |
| `/properties/[slug]` | `<h1>` ("3BHK · Oakwood Residency") | 0.94s | 0.000 | < 45ms | ~125 KB |
| `/communities` | `<h1>` ("Run the community from one place") | 0.85s | 0.000 | < 35ms | ~110 KB |
| `/operations` | `<h1>` ("Everyone who runs the building, on one line") | 0.82s | 0.000 | < 30ms | ~105 KB |
| `/pricing` | `<h1>` ("Seekers pay nothing...") | 0.78s | 0.000 | < 25ms | ~98 KB |
| `/about` | `<h1>` ("We started by running buildings...") | 0.81s | 0.000 | < 30ms | ~102 KB |
| `/contact` | `<h1>` ("Get in touch with HTC") | 0.76s | 0.000 | < 25ms | ~95 KB |
| `/list-your-property`| `<h1>` ("Your next tenant already lives...") | 0.84s | 0.000 | < 35ms | ~112 KB |

---

## 4. Stability Sweep Review

- **Zero `.pin-spacer` elements**: Confirmed.
- **Zero `position: fixed` within section content**: Confirmed.
- **Zero section overlapping**: Confirmed across 150px vertical scroll increments.
- **Zero unhandled console warnings or errors**: Confirmed.
