# Changelog

All notable changes to the HTC platform are documented in this file.

---

## [Revision 11] - 2026-09-21: Hero Simplification and Legibility Over Photography

### Rationale
Per owner instruction, simplified the homepage hero by removing the search module and verification badge, replacing them with two clear primary/secondary call-to-action buttons, and switching to a high-contrast warm-dark directional scrim (`--ink-900`) with white copy so all slide photography is legible and visible across the entire carousel.

### Removed
- **Search Module in Hero**: Removed tabs, search input, Search button, and the "Popular:" row from `components/sections/Hero.tsx`.
- **Verification Badge in Hero**: Removed the badge component and its wrapper above H1.
- **Word Blur on Rotating Line**: Removed `filter: blur()` from the rotating line word animation to prevent smearing during transitions (`components/sections/hero/RotatingLine.tsx`).

### Added / Changed
- **Hero CTAs**: Added two prominent call-to-action buttons:
  - Primary: "Find a home" (`--red-600` fill, white text, 52px height, links to `/properties`).
  - Secondary: "List your property" (transparent fill, 1.5px `rgba(255,255,255,0.7)` border, white text, links to `/list-your-property`).
- **Reassurance Line**: Added "No brokerage. No fee to contact an owner." below the CTAs.
- **Directional Scrim (`[data-hero-scrim]`)**: Replaced the previous paper scrim with a warm dark `--ink-900` horizontal gradient (dark behind copy, clear on right around card), vertical grounding, and top header protection. On mobile (< 768px), switches to a vertical scrim.
- **Header Dynamics (`components/layout/Header.tsx`)**: Header is transparent with white wordmark, white nav links, white-outline `List Property` pill, and white-filled `Sign In` pill over the hero; smoothly transitions to paper background with dark text on scroll.
- **Search Placement**: Preserved search functionality on `/properties` with fixed `:focus-within` focus styling (resolving L-04 focus ring defect).
- **Hero Card Styling**: Updated carousel card with lighter inset border (`rgba(255,255,255,0.35)`) and refined shadow.
- **Contrast Matrix**: WCAG AA contrast $\ge 4.5:1$ achieved across all 4 slides, 7 text elements, and 3 viewports (1440px, 1024px, 390px).

---

## [Revision 10] - 2026-09-21: Full Front-End Test Programme + Site-Wide Image Generation
- Comprehensive baseline testing and AI photo generation across all 20 image slots.
- Stand-in asset generation pipeline and regression test suite.

---

## [Revision 09] - 2026-09-21: Photo Transitions — Hero Carousel and Difference Section
- Soft Reveal transition system for ambient background and difference frame stack.

---

## [Revision 08] - 2026-09-21: Animation Consolidation & Stabilisation
- Consolidated single-driver scroll and transition architecture.
