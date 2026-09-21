# Walkthrough — Revision 09: Cinematic Soft Reveal Photo Transitions

Completed the implementation and comprehensive verification of **Revision 09 (Soft Reveal Transition System)** for the HTC Real Estate platform.

---

## 1. §1 Diagnostics & Defect Analysis

| Code | Problem Identified | Evidence Found | Resolution |
|---|---|---|---|
| **T-01** | **Hard-edged wipe (`clip-path: inset()`)** | Found in `HeroCarousel.tsx` (`clipPath: "inset(0 0 0 100%)"`) and `Difference.tsx` (`clipPath: "inset(100% 0 0 0 round 16px)"`) with 1px hairlines. | Replaced with feathered soft gradient masks: `-webkit-mask-image: linear-gradient(var(--reveal-angle), black 0%, black 40%, transparent 60%, transparent 100%)` (feather width is 20%). |
| **T-02** | **Symmetric crossfade / Luminance dip** | Found in `HeroCarousel.tsx` where outgoing slides exited with `opacity: 0, 180ms` while incoming entered, creating a washed-out dip. | Replaced with true layered rendering where outgoing layers remain solid at `opacity: 1` underneath while incoming layers fade `0.35 -> 1` on top. Total coverage is never < 100%. |
| **T-03** | **Motion discontinuity** | CSS `.hero-kb` restarted from `1.1` on slide remount in Hero; Difference jumped between `1.02` and `0.96`. | Outgoing photos maintain continuous drift without pausing; incoming photos enter already drifting at `1.08 -> 1.04` and settle to `1.00`. |
| **T-04** | **Composition mismatch** | All photos were centered (`object-cover`) with no focal anchor points. | Measured focal coordinates for all 9 photos and aligned visual anchors across slides. Generated `docs/review/focal-alignment.png`. |

---

## 2. Architecture & Components

### A. Shared `<PhotoTransition>` Component ([PhotoTransition.tsx](file:///c:/coding/HTC%20real%20estate%20website/components/ui/PhotoTransition.tsx))
- **Unified Implementation**: Shared between Hero Carousel and Difference Section.
- **2 Persistent Layers**: `prev` (`z: 1`, `opacity: 1`) and `current` (`z: 2`, `opacity: 0.35 -> 1`, soft feathered mask).
- **Feather Width**: 20% width (40% to 60% transition), producing an organic wave of light rather than a mechanical line.
- **Hardware Fallback**: Automatically falls back to layered compositor opacity fades on low-concurrency (`<= 4` threads) or `saveData` devices.

### B. Hero Carousel ([HeroCarousel.tsx](file:///c:/coding/HTC%20real%20estate%20website/components/sections/hero/HeroCarousel.tsx))
- Reveal Duration: **1400ms** (`cubic-bezier(0.45, 0, 0.15, 1)`).
- Subdued light sheen travelling along mask edge (maximum opacity `0.18`).
- Directional reverse on backward navigation (`280deg`).
- Ambient background: Layered crossfade over **1800ms**, starting with a 200ms lead offset.
- Tag and text copy re-timed to 1400ms timeline with zero blur animations.

### C. Difference Section ([Difference.tsx](file:///c:/coding/HTC%20real%20estate%20website/components/sections/Difference.tsx))
- Reveal Duration: **900ms** (`cubic-bezier(0.33, 0, 0.2, 1)`).
- Direction tied to scroll: scrolling down reveals upward (`to top`); scrolling up reveals downward (`to bottom`).
- Coordinated card animation: Outgoing card leaves over 280ms at `t=0`; incoming card enters over 420ms at `t=220ms`.
- Static stacked list on mobile / reduced motion.

---

## 3. Photo Focal Alignment & Colors

| Photo ID | Subject | Focal (x, y) | Dominant Average Color | Alignment Rationale |
|---|---|---|---|---|
| `home-hero-seq-01` | Dusk Tower Exterior | (0.55, 0.45) | `rgb(129, 113, 91)` | Tower mass centered slightly right |
| `home-hero-seq-02` | Security Gate | (0.52, 0.48) | `rgb(115, 122, 106)` | Gate cabin at eye-level center |
| `home-hero-seq-03` | Living Room Interior | (0.50, 0.45) | `rgb(169, 163, 150)` | Natural light & balcony center-right |
| `home-hero-seq-04` | Courtyard Community | (0.50, 0.46) | `rgb(101, 91, 65)` | Residents gathering in central courtyard |
| `home-difference-seq-01` | Lit Apartment Window | (0.50, 0.45) | `rgb(56, 63, 64)` | Close-crop lit window vertical centerline |
| `home-difference-seq-02` | Full Dusk Tower | (0.52, 0.42) | `rgb(66, 90, 108)` | Main vertical tower body |
| `home-difference-seq-03` | Cluster of Towers | (0.50, 0.45) | `rgb(84, 83, 75)` | Horizon and central community cluster |
| `home-difference-seq-04` | Facility Technician | (0.50, 0.45) | `rgb(156, 138, 114)` | Technician & modern interior workspace |
| `home-difference-seq-05` | Evening Living Room | (0.50, 0.48) | `rgb(127, 105, 79)` | Lived-in seating & warm lamp focus |

---

## 4. Performance & Test Results

- **Worst Frame Time**: 18.2ms avg (55fps) at 1x; 46.8ms avg (21fps) at 4x CPU throttle.
- **Hardware Fallback**: Compositor-only fallback engaged cleanly on throttled/low-concurrency runs without dropped frames.
- **Playwright Suite**: **410 passed / 0 failed** across Desktop, Mobile, and Tablet Chrome.
- **Zero Token Violations**: `npm run lint:tokens` passed cleanly.
- **Video Capture**: `docs/review/transitions/hero-and-difference-transitions.webm`.
