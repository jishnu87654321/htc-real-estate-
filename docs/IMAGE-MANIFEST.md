# HTC — Photography Sourcing Sheet & Master Image Manifest

**Revision:** REV-10  
**Updated:** 2026-09-21  
**Status:** 34 stand-in image slots populated · 7 initials avatars active · Production gate active

---

## 1. Stand-In Guardrails & Art Direction Rules

- **Stand-In Principle:** Every generated image is an explicit stand-in for design review and stakeholder sign-off, to be replaced by verified real photography before public production launch.
- **Zero Synthetic Faces for Testimonials & Team:** Customer testimonials (`home-testimonial-01..03`) and Team members (`about-team-01..04`) use **Initials Avatars** (56px and 120px `--red-100` / `--red-700` Instrument Serif monograms) to preserve authentic brand credibility.
- **Stand-In Indicator Badge:** When `NEXT_PUBLIC_SHOW_STANDIN_BADGE=true` or in development, a `Sample image` badge renders in the bottom-left corner of each placeholder image.
- **Prebuild Production Gate:** `scripts/check-standins.mjs` prevents production builds if stand-ins exist unless `ALLOW_STANDIN_IMAGES=true` is explicitly passed.

---

## 2. Complete Asset Register & Decision Table

| ID | Page / Section | Ratio | Category | Source / Status | Art Direction & Description |
|---|---|---|---|---|---|
| `home-hero-seq-01` | Home / Hero | 4/5 | EXT-DUSK | `stand-in — replace before launch` | Mid-rise residential community exterior at dusk with illuminated balconies. |
| `home-hero-seq-02` | Home / Hero | 4/5 | EXT-DAY | `stand-in — replace before launch` | Security entrance gate with guard cabin, boom barrier, and clean landscaping. |
| `home-hero-seq-03` | Home / Hero | 4/5 | INT-DAY | `stand-in — replace before launch` | Bright empty modern apartment living room with sunlight from balcony doors. |
| `home-hero-seq-04` | Home / Hero | 4/5 | EXT-DAY | `stand-in — replace before launch` | Residents walking in lush central courtyard and clubhouse terrace. |
| `home-difference-seq-01` | Home / Difference | 4/5 | EXT-DUSK | `stand-in — replace before launch` | Close crop: single warm-lit apartment window at dusk with interior glow. |
| `home-difference-seq-02` | Home / Difference | 4/5 | EXT-DUSK | `stand-in — replace before launch` | Medium shot: full residential tower facade at dusk, several windows lit. |
| `home-difference-seq-03` | Home / Difference | 4/5 | EXT-DUSK | `stand-in — replace before launch` | Wide panorama: cluster of residential towers around central courtyard. |
| `home-difference-seq-04` | Home / Difference | 4/5 | PEOPLE-OPS | `stand-in — replace before launch` | Facility technician at work inside home; warm competent lighting. |
| `home-difference-seq-05` | Home / Difference | 4/5 | INT-EVE | `stand-in — replace before launch` | Calm, lived-in living room in the evening with warm lamps. |
| `home-featured-01` | Home / Featured | 4/3 | INT-DAY | `stand-in — replace before launch` | Spacious 3 BHK living room with contemporary neutral furniture and sunlight. |
| `home-featured-02` | Home / Featured | 4/3 | INT-DAY | `stand-in — replace before launch` | Modern open-plan kitchen and dining area with modular cabinets. |
| `home-featured-03` | Home / Featured | 4/3 | INT-DAY | `stand-in — replace before launch` | Serene master bedroom with wooden flooring and wide corner window. |
| `home-featured-04` | Home / Featured | 4/3 | INT-DAY | `stand-in — replace before launch` | Elegant balcony sit-out overlooking green society garden. |
| `home-featured-05` | Home / Featured | 4/3 | INT-DAY | `stand-in — replace before launch` | Premium bathroom with glass shower enclosure and warm tile finishes. |
| `home-featured-06` | Home / Featured | 4/3 | INT-DAY | `stand-in — replace before launch` | Cozy study/home-office nook with desk and bookshelf in sunlit flat. |
| `home-feature-01` | Home / Communities | 16/10 | EXT-DAY/INT | `stand-in — replace before launch` | Bright apartment corridor with flat doors, afternoon sunlight. |
| `home-feature-02` | Home / Communities | 16/10 | PEOPLE | `stand-in — replace before launch` | Residents' mailboxes and lobby with a resident holding a phone from behind. |
| `home-feature-03` | Home / Communities | 16/10 | EXT-DAY | `stand-in — replace before launch` | Community entrance gate and security cabin, guard at a distance. |
| `home-feature-04` | Home / Communities | 16/10 | PEOPLE-OPS | `stand-in — replace before launch` | Technician's hands working on a switchboard, close crop. |
| `home-feature-05` | Home / Communities | 16/10 | INT-EVE | `stand-in — replace before launch` | Clubhouse or community hall interior, a few residents seated from behind. |
| `home-feature-06` | Home / Communities | 16/10 | PEOPLE-OPS | `stand-in — replace before launch` | Housekeeping or maintenance staff walking a landscaped podium from behind. |
| `home-owners-01` | Home / For Owners | 1/1 | DETAIL | `stand-in — replace before launch` | Close crop: hands handing over silver brass house keys in warm indoor light. |
| `detail-gallery-01` | Detail / Hero | 21/9 | INT-DAY | `stand-in — replace before launch` | Coherent flat: living room with balcony doors in bright natural daylight. |
| `detail-gallery-02` | Detail / Thumbs | 4/3 | INT-DAY | `stand-in — replace before launch` | Coherent flat: master bedroom with corner window and matching wood finish. |
| `detail-gallery-03` | Detail / Thumbs | 4/3 | INT-DAY | `stand-in — replace before launch` | Coherent flat: modular kitchen with quartz counter and clean cabinetry. |
| `detail-gallery-04` | Detail / Thumbs | 4/3 | INT-DAY | `stand-in — replace before launch` | Coherent flat: glass-partitioned modern bathroom with warm tile. |
| `detail-gallery-05` | Detail / Thumbs | 4/3 | INT-DAY | `stand-in — replace before launch` | Coherent flat: high-floor balcony overlooking central garden. |
| `detail-rooms-seq-01` | Detail / Floor Plan | 16/10 | INT-DAY | `stand-in — replace before launch` | Coherent flat: living room entrance view. |
| `detail-rooms-seq-02` | Detail / Floor Plan | 16/10 | INT-DAY | `stand-in — replace before launch` | Coherent flat: kitchen view from dining threshold. |
| `detail-rooms-seq-03` | Detail / Floor Plan | 16/10 | INT-DAY | `stand-in — replace before launch` | Coherent flat: master bedroom. |
| `detail-rooms-seq-04` | Detail / Floor Plan | 16/10 | INT-DAY | `stand-in — replace before launch` | Coherent flat: secondary bathroom. |
| `detail-rooms-seq-05` | Detail / Floor Plan | 16/10 | INT-DAY | `stand-in — replace before launch` | Coherent flat: balcony view outward. |
| `owners-carousel-01` | List Property / Hero | 1/1 | INT-DAY | `stand-in — replace before launch` | Empty bright living room ready to let with sunlight and balcony doors. |
| `owners-carousel-02` | List Property / Hero | 1/1 | INT-DAY | `stand-in — replace before launch` | The same living room, same camera position, furnished with sofa and rug. |
| `owners-carousel-03` | List Property / Hero | 1/1 | PEOPLE-OPS | `stand-in — replace before launch` | Facility manager's hands holding checklist tablet beside flat door. |
| `owners-carousel-04` | List Property / Hero | 1/1 | DETAIL | `stand-in — replace before launch` | Owner reviewing enquiries on smartphone at wooden table. |
| `owners-carousel-05` | List Property / Hero | 1/1 | DETAIL | `stand-in — replace before launch` | Brass keys handed over to new tenant in doorway. |
| `communities-carousel-01` | Communities / Hero | 1/1 | EXT-DAY | `stand-in — replace before launch` | Community entrance gate with security cabin, digital kiosk, guard at distance. |
| `communities-carousel-02` | Communities / Hero | 1/1 | INT-DAY | `stand-in — replace before launch` | Community clubhouse interior with residents relaxing seen from behind. |
| `communities-carousel-03` | Communities / Hero | 1/1 | PEOPLE-OPS | `stand-in / placeholder` | Facility manager at desk with laptop in community office. |
| `communities-carousel-04` | Communities / Hero | 1/1 | PEOPLE-OPS | `stand-in / placeholder` | Committee members meeting around table with blueprints and laptop. |
| `communities-carousel-05` | Communities / Hero | 1/1 | DETAIL | `stand-in / placeholder` | Resident hand holding smartphone in lobby with app open. |
| `home-testimonial-01` | Home / Testimonials | 1/1 | AVATAR | `replaced by 56px initials avatar` | Resident testimonial initials monogram. |
| `home-testimonial-02` | Home / Testimonials | 1/1 | AVATAR | `replaced by 56px initials avatar` | Owner testimonial initials monogram. |
| `home-testimonial-03` | Home / Testimonials | 1/1 | AVATAR | `replaced by 56px initials avatar` | Committee secretary initials monogram. |
| `about-team-01..04` | About / Team | 3/4 | AVATAR | `replaced by 120px initials avatar` | Team member initials monogram cards. |
