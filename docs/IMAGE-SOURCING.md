# HTC — Image Sourcing & Drop-in Photography Guide

## 1. Overview

The HTC platform uses a zero-code drop-in architecture for real photography. Placeholder frames automatically transition to high-resolution optimized photography as soon as image files are placed in the sequence directory.

---

## 2. Directory Structure & File Naming

All photographic assets must be placed in:
```
public/sequences/<id>.<ext>
```
Where `<id>` matches the exact ID in [`docs/IMAGE-MANIFEST.md`](file:///c:/coding/HTC%20real%20estate%20website/docs/IMAGE-MANIFEST.md).

### Examples
- `public/sequences/home-hero-seq-01.jpg`
- `public/sequences/home-hero-seq-02.webp`
- `public/sequences/home-difference-seq-01.jpg`
- `public/sequences/properties-listing-01.jpg`
- `public/sequences/detail-rooms-seq-01.jpg`

---

## 3. Recommended Dimensions by Aspect Ratio

To preserve sharp typography and responsive crispness without excessive download weight:

| Aspect Ratio | Recommended Resolution | Typical Placements |
|---|---|---|
| **4/5** | `1200 × 1500 px` | Homepage Hero, Difference Section |
| **4/3** | `1600 × 1200 px` | Featured Homes, Property Catalog Grid |
| **16/10** | `1600 × 1000 px` | Property Detail Floor Plan Sequence |
| **21/9** | `2100 × 900 px` | Property Detail Gallery Hero |
| **1/1** | `1200 × 1200 px` | For Owners Hero Stack, Testimonials |
| **3/4** | `1200 × 1600 px` | Communities Filmstrip, Team Portraits |
| **16/9** | `1920 × 1080 px` | Vector Location Maps |

---

## 4. File Size & Format Standards

- **Target File Size**: Strictly under **300 KB** per image.
- **Preferred Formats**:
  1. **WebP** (Quality 80–85) — Default recommendation for best balance of compression and clarity.
  2. **AVIF** (Quality 75–80) — Best compression for modern browsers.
  3. **Progressive JPEG** (Quality 82–86) — Acceptable fallback.

---

## 5. Building the Image Manifest

Whenever you add or delete files in `public/sequences/`, run the build-time scanner:

```bash
node scripts/scan-images.mjs
```

This scans `public/sequences/` and generates `lib/available-images.json`. The `<Placeholder>` component instantly detects the files and renders Next.js `<Image>` components with lazy loading, optimal breakpoint `sizes`, and layout-shift protection.

---

## 6. Commercial Licensing & Ethics Standards

- **Commercial Stock Only**: All imagery sourced from libraries (Unsplash+, Adobe Stock, Shutterstock, Getty) must be licensed for commercial digital web use.
- **No Scraped Content**: Never use images downloaded from competitor portals, Google Image search, or proprietary society websites.
- **Indian Urban Residential Authenticity**: Photography must depict contemporary Indian gated communities, mid-rise / high-rise apartments, and authentic resident demographics (Bangalore, Hyderabad, Pune, Mumbai, NCR).
