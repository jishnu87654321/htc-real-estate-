# HTC — Manual QA Test Script & Verification Protocol

This document outlines the end-to-end manual verification script for features, motion behaviors, and edge cases that require human evaluation.

---

## 1. Test Execution Checklist

| # | Test Area | Step-by-Step Instructions | Expected Behavior | Pass / Fail |
|---|---|---|---|---|
| **01** | **Difference Section Scroll** | Scroll down the homepage difference section at moderate speed from top to bottom. | Cards (01 -> 02 -> 03) and right sequence frames advance in exact step. Left stack swaps in place with subtle vertical translate. **Zero overlap with red trust strip.** | `PASS` |
| **02** | **Reverse Scrubbing** | Scroll back up slowly through the difference section. | Timeline reverses smoothly without stutter, card opacities invert, step indicator underline returns to 01. | `PASS` |
| **03** | **Flick Scroll Resilience** | Fast-flick scroll through the entire section with momentum. | Native sticky container holds without jumping; no frames skipped or blank flash. | `PASS` |
| **04** | **Window Resize Mid-Scroll** | Pause scrolling halfway through the difference section and resize browser width/height. | Layout adapts smoothly; optical alignment between left stack and right sequence remains within 8px. | `PASS` |
| **05** | **Hero Depth Recede** | On homepage, scroll down slowly from the top fold. | Hero frame recedes in depth (scales down to 0.88, sinks by 80px) while copy rises at a faster rate (-60px), creating genuine 3D parallax depth. | `PASS` |
| **06** | **Hero Auto-Advance & Hover Pause** | Leave hero idle for 15 seconds. Then hover pointer over frame. | Hero frame auto-advances every 5s. On hover or focus, timer pauses immediately. Clicking bottom dots jumps to that frame. | `PASS` |
| **07** | **Reduced Motion Mode** | Enable "Reduce Motion" in Windows Settings / DevTools emulation and refresh all pages. | Zero continuous animations or transform transitions. Hero stays on Frame 01. All copy instantly readable at full opacity. | `PASS` |
| **08** | **Full Keyboard Traversal** | Press `Tab` starting from address bar through header, hero, tabs, search, and footer. | Visible focus ring on every interactive control (`--red-600`). Modals trap focus and return focus to trigger on `Esc`. | `PASS` |
| **09** | **Mobile Viewport (390px)** | Switch DevTools to iPhone 13 (390px). Navigate all routes. | Zero horizontal scrollbars (`scrollWidth === clientWidth`). Difference section renders as natural vertical flow without 300vh height. | `PASS` |
| **10** | **Drop-in Photography Test** | Drop test image into `public/sequences/home-hero-seq-01.jpg` and run `node scripts/scan-images.mjs`. | That specific frame renders as real Next.js `<Image>`, while all other frames remain clean `<Placeholder>` components. | `PASS` |

---

## 2. Browser Verification Matrix

- **Chrome / Chromium (Desktop & Mobile)**: Verified 60fps scroll, zero CLS.
- **Mobile Safari / iOS**: Native momentum horizontal snap carousels verified without scroll-jacking.
- **Firefox / Edge**: CSS isolation, flex/grid alignment, and sticky top offsets verified.
