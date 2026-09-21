# HTC Image Style Guide & Art Direction Specification

**Revision:** REV-10  
**Scope:** All visual assets, photograph stand-ins, and initials avatars across the HTC platform.

---

## 1. Core Principle & Brand Promise

Every generated photograph is a **stand-in for design review and stakeholder sign-off**, to be replaced by real photography of HTC-managed properties before public launch. HTC's foundational proposition is authenticity: listings and communities are real, verified, and run by on-site teams.

### Universal Aesthetic Requirements
- **Context:** Indian urban residential context (Hyderabad/Bengaluru aesthetic: mid-rise and high-rise gated communities, wide balconies, lush perimeter trees, vitrified tile flooring, modular kitchens).
- **Lighting:** Natural daylight or warm ambient evening light; avoid synthetic CGI glare or studio lighting.
- **Lens & Color:** 35mm-equivalent lens, natural color saturation, gentle contrast, subtle authentic film grain.
- **Ethical Restraints:**
  - **Zero Testimonial/Team Faces:** Testimonials and team portraits strictly use Initials Avatars.
  - **No Close-Up Faces:** People are captured from behind, in profile at a distance, or softly out of focus.
  - **No Children as Focal Subjects.**
  - **No Readable Text or Logos:** No building names, license plates, commercial signboards, or brand emblems.

---

## 2. Photographic Categories

| Category | Lighting & Atmosphere | Composition & Subject | Intended Locations |
|---|---|---|---|
| **EXT-DUSK** | Blue hour, twilight sky, warm glowing interior windows. | High-rise residential towers, dusk balconies, landscaped central courtyards. | Hero carousel, Difference sequence frame 01. |
| **EXT-DAY** | Soft late-afternoon sunlight, clear atmospheric depth. | Community entry gates, security kiosks, podium greenery, clubhouse facades. | Communities page, About page communities, Hero daylight frames. |
| **INT-DAY** | Bright natural daylight streaming through sliding balcony doors. | Clean, un-staged Indian apartment interiors (living rooms, bedrooms, modular kitchens, bathrooms). | Property Detail gallery, Room sequence, Featured homes cards. |
| **INT-EVE** | Warm interior lamps (2700K), cozy domestic ambience. | Lived-in apartments with warm evening light, balcony views of night lights. | Difference sequence frame 05, Owner sequence frame 02. |
| **PEOPLE-OPS** | Natural, unstaged facility operations. | Hands at work, technicians with toolboxes, security logs, key handovers. Faces never in focal focus. | Services tiles, Behind-the-gate diagrams, Operations page. |
| **DETAIL** | Macro/close crop, shallow depth of field. | Brass key handovers, gate biometric touchpads, maintenance dispatch sheets. | For Owners card, Difference frame 04. |

---

## 3. Rejection Checklist (Quality Assurance)

Every generated asset must pass all items below prior to inclusion in the site manifest:
- [x] No legible or pseudo-legible text, building names, or shop signs.
- [x] Plausible structural geometry (straight verticals, realistic window grids, correct balcony railings).
- [x] Natural human anatomy (no distorted hands, extra fingers, or synthetic uncanny faces).
- [x] Authentic Indian urban residential architecture (no American suburban siding or Dubai glass monoliths).
- [x] Natural color tone and texture (no over-saturated neon hues or synthetic 3D-render gloss).
- [x] Visual coherence within its assigned set (matching light temperature, floor finishes, and lens depth).

---

## 4. Stand-In Guardrail System

1. **Manifest Registration:** Every generated asset in `docs/IMAGE-MANIFEST.md` is tagged `source: generated`, `status: stand-in — replace before launch`.
2. **Registry Flag:** `lib/available-images.json` includes `generated: true` for all AI-generated assets.
3. **Sample Image Badge:** When `NEXT_PUBLIC_SHOW_STANDIN_BADGE=true`, a discreet `Sample image` pill is displayed in the bottom-left corner of each stand-in.
4. **Production Build Gate:** `scripts/check-standins.mjs` executes during `prebuild`. If `NODE_ENV=production` and generated images exist, the build fails with an explicit error unless `ALLOW_STANDIN_IMAGES=true` is set.
