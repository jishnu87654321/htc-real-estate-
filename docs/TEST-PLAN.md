# HTC — Front-End Test Programme & Quality Plan (Revision 10)

## 1. Site Inventories

### 1.1 Route Inventory

| Route | Primary Sections in Order | Primary Interactions |
|---|---|---|
| `/` | Header · Hero (Search + Ambient Carousel) · Trust Strip · The Difference (Sticky Frame Sequence) · Behind the Gate (Comms Diagram) · Three Steps · Featured Properties · For Owners · Testimonials · Footer | Search tab switch, query input & submit, popular links, hero carousel controls, difference scroll scrub, comms diagram pause/hover, testimonials avatar review, CTA clicks. |
| `/properties` | Header · Filter Toolbar · Property Grid (Search Results) · Empty State · Pagination / Save Search · Footer | Filter pills, locality filter, BHK filter, price range slider, HTC-managed toggle, sort dropdown, mobile filter drawer, property card clicks. |
| `/properties/[slug]` | Header · Property Hero · Gallery & Thumbnail Strip · Specs Bar · Room Sequence · Amenities & Floor Plan · Location Map & Landmarks · Schedule Viewing Modal · Sticky Mobile Bar · Footer | Image gallery lightbox/thumbs, floorplan room hotspot jumps, contact agent modal, schedule visit form validation, sticky bottom bar. |
| `/communities` | Header · Hero Video/Filmstrip · Interactive Audience Tabs (Owners vs Residents) · Resident App Features · Walkthrough CTA · Footer | Audience tabs toggle, walkthrough schedule form, video controls, feature accordion. |
| `/communities/residents` | Header · Resident Portal Overview · Maintenance Request Mockup · Gate Pass Workflow · Community Board · Footer | Feature walkthrough, interactive demo cards, FAQ accordion. |
| `/list-your-property` | Header · 5-Step Owner Listing Wizard · Fee Breakdown · Owner Guarantees · Footer | 5-step form wizard, back/next navigation, step validation, progress indicator, submit handler. |
| `/operations` | Header · Facility Management Overview · SLA Guarantees · Technology Stack · Emergency Response · Footer | Operations SLA metrics, tech stack tabs, team dispatch demo. |
| `/about` | Header · Mission & Heritage · Managed Society Stats · Leadership & Team Grid · Partner Network · Footer | Stats counters, team avatar grid, partner links. |
| `/pricing` | Header · Owner Plans Toggle (Standard vs Managed) · Fee Comparison Matrix · FAQ · Footer | Plan toggle switch, feature comparison table, FAQ accordion. |
| `/contact` | Header · Routing Selector (Tenant / Owner / Society / Press) · Dynamic Contact Form · Office Locations · Footer | Purpose selector, dynamic field validation, message submit toast. |

---

### 1.2 Placeholder Inventory & Generation Strategy

| ID | Page / Section | Ratio | Category (§2.2) | Currently Filled? | Generation Decision (§2.3) | Rationale / Stand-in Treatment |
|---|---|---|---|---|---|---|
| `home-hero-seq-01` | Home / Hero | 4/5 | EXT-DUSK | Yes | ✅ Kept | Real photography (`/sequences/home-hero-seq-01.jpg`) |
| `home-hero-seq-02` | Home / Hero | 4/5 | EXT-DAY | Yes | ✅ Kept | Real photography (`/sequences/home-hero-seq-02.jpg`) |
| `home-hero-seq-03` | Home / Hero | 4/5 | INT-DAY | Yes | ✅ Kept | Real photography (`/sequences/home-hero-seq-03.jpg`) |
| `home-hero-seq-04` | Home / Hero | 4/5 | EXT-DAY | Yes | ✅ Kept | Real photography (`/sequences/home-hero-seq-04.jpg`) |
| `home-difference-seq-01` | Home / Difference | 4/5 | EXT-DUSK | Yes | ✅ Kept | Real photography (`/sequences/home-difference-seq-01.jpg`) |
| `home-difference-seq-02` | Home / Difference | 4/5 | EXT-DUSK | Yes | ✅ Stand-in | Generated dusk tower (`/sequences/home-difference-seq-02.jpg`) |
| `home-difference-seq-03` | Home / Difference | 4/5 | EXT-DUSK | Yes | ✅ Stand-in | Generated dusk cluster (`/sequences/home-difference-seq-03.jpg`) |
| `home-difference-seq-04` | Home / Difference | 4/5 | PEOPLE-OPS | Yes | ✅ Stand-in | Modern interior technician (`/sequences/home-difference-seq-04.jpg`) |
| `home-difference-seq-05` | Home / Difference | 4/5 | INT-EVE | Yes | ✅ Stand-in | Lived-in evening living room (`/sequences/home-difference-seq-05.jpg`) |
| `home-featured-01..06` | Home / Featured | 4/3 | INT-DAY | Yes | ✅ Stand-in | 6 distinct apartment interior photos (`/sequences/home-featured-01..06.jpg`) |
| `home-owners-01` | Home / For Owners | 1/1 | DETAIL | Yes | ✅ Stand-in | Hands handing over house keys (`/sequences/home-owners-01.jpg`) |
| `home-testimonial-01..03` | Home / Testimonials | 1/1 | AVATAR | No | ❌ **Do not generate** | **Initials Avatar**: 56px circle, `--red-100` fill, `--red-700` Instrument Serif initials from resident name. |
| `about-team-01..04` | About / Team | 3/4 | AVATAR | No | ❌ **Do not generate** | **Initials Avatar / Monogram Card**: 120px circular monogram card (`awaiting real team photography`). |
| `detail-gallery-01..05` | Detail / Hero & Thumbs | 21/9, 4/3 | INT-DAY | No | ✅ Generate Set | Coherent single flat (living, kitchen, master, bath, balcony). |
| `detail-rooms-seq-01..05` | Detail / Floor Plan Seq | 16/10 | INT-DAY | No | ✅ Generate Set | Same coherent flat aligned to floor-plan room hotspots. |
| `owners-seq-01..03` | List Property / Seq | 1/1 | INT-DAY/EVE | No | ✅ Generate Set | Empty room (01) -> furnished room (02) [same camera angle] -> keys handover (03). |
| `communities-seq-01..05` | Communities / Filmstrip | 3/4 | EXT-DAY / OPS | No | ✅ Generate Set | Digital visitor kiosk, clubhouse lounge, operations desk, resident meeting, lobby app. |
| `detail-location-map` | Detail / Location | 16/9 | DETAIL | No | ❌ Do not generate | High-contrast vector GIS map diagram with landmarks. |

---

### 1.3 Interaction Inventory

1. **Global Header & Navigation**:
   - Primary links: Properties, Communities, Operations, About, Pricing, Contact
   - Primary CTA: "List Property" button -> `/list-your-property`
   - Secondary CTA: "Sign In" button -> Account modal
   - Mobile Hamburger Menu: Open, trap focus, navigation dismissal, ESC key dismissal
2. **Search Module (Hero & Properties)**:
   - Tab switch: Rent / Buy / Commercial
   - Query input with dynamic responsive placeholder
   - Submit navigation to `/properties?q=...`
   - Popular location pill clicks (Gachibowli, Kondapur, HITEC City, Madhapur)
3. **Difference Frame Stack**:
   - Scroll-scrubbed integer step selection (01 to 05) with 4% hysteresis
   - Timed 900ms soft reveal transition with continuous scale/offset
   - Dual-rail progress indicators
4. **Behind the Gate Diagram**:
   - 5-node orbital animation with central HTC hub
   - Hover / focus pause mechanism
   - Pause/play accessible control toggle
   - Node tooltips & active token tracking
5. **List Your Property Form**:
   - 5 sequential form steps (Property Details, Pricing, Ownership Proof, Verification Slot, Confirmation)
   - Step validation with exact microcopy errors
   - Back / next step navigation
6. **Property Detail Interactive Modules**:
   - Thumbnail gallery selector
   - Floorplan hotspot room selector
   - Viewing booking modal with focus trap
   - Sticky bottom contact bar for mobile

---

## 2. The Test Matrix

| Dimension | Values Covered | Justification |
|---|---|---|
| **Routes** | 10 routes: `/`, `/about`, `/communities`, `/communities/residents`, `/contact`, `/list-your-property`, `/operations`, `/pricing`, `/properties`, `/properties/3bhk-my-home-bhooja-hitec-city` | Complete site coverage including dynamic route slug. |
| **Viewports** | 360×740, 390×844 (Mobile), 768×1024, 1024×768 (Tablet), 1280×800, 1440×900 (Desktop), 1920×1080, 2560×1440 (Ultra-wide) | Verification of responsive tokens, container gutters, touch targets, and typography. |
| **Browsers** | Chromium, WebKit (Safari), Firefox | Engine diversity testing layout, CSS masks, transitions, and subpixel math. |
| **Modes** | Default, `prefers-reduced-motion: reduce`, JavaScript Disabled, 4× CPU Throttling, 200% Browser Zoom | Full accessibility and resilience auditing. |

---

## 3. Ten Test Suites Specification

1. **Suite 1: SSR & Rendering (`tests/ssr.spec.ts`)**:
   - Production server 200 status codes on all routes.
   - Raw HTML contains H1 and introductory copy prior to JS hydration.
   - Zero console errors or unhandled promise rejections.
   - 404 route handling.
2. **Suite 2: Content Fidelity (`tests/content.spec.ts`)**:
   - SPEC headlines, card copy, and FAQ questions match verbatim.
   - Banned marketing buzzwords absent.
   - Zero `undefined`, `NaN`, `[object Object]`, or lorem ipsum.
3. **Suite 3: Layout Integrity (`tests/layout.spec.ts`)**:
   - Zero horizontal overflow across all 8 viewports.
   - Responsive placeholder never truncated.
   - Header action items contained without right-edge clipping.
   - Touch targets >= 44x44px below 768px.
4. **Suite 4: Interaction (`tests/interaction.spec.ts`)**:
   - Header navigation, mobile drawer focus traps, search filter query params.
   - Modals trap focus and return focus on close.
   - 5-step listing form validation and submission.
5. **Suite 5: Animation Stability (`tests/animation.spec.ts`)**:
   - Single clock hero transitions, difference section scroll sync.
   - Zero `position: fixed` inside section flow; zero `.pin-spacer`.
   - Reduced motion disables autoplay and converts sequences to static layouts.
6. **Suite 6: Accessibility (`tests/a11y.spec.ts`)**:
   - Automated axe audits (WCAG 2.1 AA) with 0 violations.
   - Keyboard tab sequence through every interactive element.
   - Color contrast >= 4.5:1 for normal text, >= 3.0:1 for large text / UI borders.
7. **Suite 7: Performance (`tests/perf.spec.ts`)**:
   - Lighthouse Performance Score >= 90.
   - LCP < 2.5s (Home < 2.0s), CLS < 0.05, TBT < 200ms.
8. **Suite 8: Visual Regression (`tests/visual.spec.ts`)**:
   - Full-page baseline screenshots at 390, 768, 1440px across Chromium, WebKit, Firefox.
9. **Suite 9: SEO & Metadata (`tests/seo.spec.ts`)**:
   - Unique descriptive title & meta description per page.
   - Canonical tags, Open Graph meta tags, robots.txt, JSON-LD Schema.
10. **Suite 10: Image Integrity (`tests/images.spec.ts`)**:
    - All images load (`naturalWidth > 0`).
    - Rendered aspect ratio matches container ratio (±1%).
    - Stand-in badges present in non-production preview environments.
