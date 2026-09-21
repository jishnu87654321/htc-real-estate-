# HTC — Design System (as built)

This documents what actually exists in the codebase, not the spec it was built
from. Where the build deviates from `HTC-BUILD-PROMPT.md`, that's called out
explicitly with the reason.

## Tokens

All colour, radius, shadow and type-scale tokens live as CSS custom properties
in `app/globals.css` (`:root`, with a `prefers-color-scheme: dark` override
block), and are re-exposed to Tailwind via a single `@theme inline` block so
every utility class (`bg-clay-600`, `text-text-secondary`, `text-display-md`,
etc.) reads the same source of truth. `lib/tokens.ts` re-declares the colour
hex values in plain JS/TS for the one place CSS variables can't reach: three.js
materials, which read `colors.ink[800]`, `colors.brass[500]`, etc. directly.

**Rule enforced:** no raw hex codes outside `app/globals.css` and `lib/tokens.ts`
— everywhere else references a token by name.

## Motion

`lib/motion.ts` exports the duration/ease/stagger tokens and `useReducedMotion()`.
Every animated component in the codebase is expected to route through one of:

- `<Reveal>` (`components/primitives/Reveal.tsx`) — the default scroll-into-view
  primitive, used for the large majority of section entrances.
- `<CountUp>` — number count-ups.
- Direct `motion/react` usage for anything `<Reveal>` can't express: shared
  card hover states, tab indicators (`layoutId`), the accordion's pure-CSS
  grid-rows trick, and the handful of legitimately bespoke scroll sequences
  (the homepage "difference" pinned scrub, the SVG comms/operations graphs,
  the sticky contact bar, testimonial counter-parallax).

Every one of these consults `useReducedMotion()` and renders the final,
settled state with no transform when it's true — this was checked page by
page, not assumed from the import list (see the audit report, Audit F).

## Placeholder system

`components/primitives/Placeholder.tsx` — CSS-only (dashed border, 4%-opacity
hatch via `repeating-linear-gradient`, Lucide `ImageIcon`, ID + label). Reserves
its box via the CSS `aspect-ratio` property, never a JS-measured height, so it
costs zero CLS budget. Every placeholder in the codebase has a matching row in
`docs/IMAGE-MANIFEST.md`; parity is enforced by rendering every route and
diffing the `data-placeholder-id` attributes against the manifest, not by
memory.

## 3D — what shipped, what was cut

| # | Scene | Status | Notes |
|---|---|---|---|
| 1 | `FloorPlan3D` (property detail) | **Shipped** | Procedurally-built rooms (extruded box walls, no GLB), clay hotspot dots, hover-only labels, damped OrbitControls (polar 20–75°, no pan, zoom clamped). |
| 2 | `HeroScene` (homepage hero) | **Shipped** | Code-built tower (`BoxGeometry`) + `InstancedMesh` window grid (108 instances, 1 draw call), per-instance colour toggled every ~600ms for the "lit window" effect, damped cursor tilt clamped to 8°, one rotation per 90s. |
| 3 | `CommunityModel` (communities hero) | **Shipped** | Code-built boxes for towers/clubhouse/gate/boundary wall, hover raises element + shows a label chip, pauses auto-rotation while hovered. |
| 4 | `ScrollCameraRig` (homepage "difference" section) | **Shipped** | GSAP `ScrollTrigger` drives a plain ref (`{ value: 0..1 }`, no React re-render per scroll tick); the R3F scene reads that ref inside its own `useFrame` and lerps camera position/lookAt across three keyframes (single window → tower → cluster). Pin + card reveal share the same `ScrollTrigger`. |
| 5 | Owner isometric loop (`/list-your-property` hero) | **Cut** | Lowest-priority scene per the spec's own ranking ("first to cut"). The hero still has a complete, non-3D fallback: three `<Placeholder>` frames (empty room → furniture → key handover) cross-fading on scroll via `motion`'s `useScroll`/`useTransform`, with a static final-state frame under reduced motion. |

All geometry above is code-built (`BoxGeometry`/`PlaneGeometry`/`SphereGeometry`
only) — there are no `.glb`/`.gltf` assets in the repo, no HDRIs, no
environment maps, and no post-processing passes. Materials reference the same
token values as the rest of the UI (`colors.ink`, `colors.brass`,
`colors.sage`, `colors.bone`, `colors.clay` from `lib/tokens.ts`).

`components/three/CanvasShell.tsx` is the single mount point for all five scene
slots (four shipped + the cut one's fallback): poster-first, lazy-mounted via
`IntersectionObserver` (`rootMargin: 200px`), gated on WebGL support,
`prefers-reduced-motion`, `navigator.connection.saveData`, and viewport width
for `desktopOnly` scenes, wrapped in a class-based error boundary that falls
back to the poster silently, and paused (`frameloop="never"`) when scrolled
out of view or the tab is hidden.

## Known, disclosed deviations from the spec

1. **Header "Sign In" is a ghost button, not clay-filled.** The spec's own
   §4 colour rule ("maximum one clay-filled button per viewport") and its §9
   header spec ("Sign In (clay filled)") conflict in practice: the header is
   present on every page, so a clay Sign In button co-occurs with almost every
   page's own clay CTA. Ghost was chosen to keep the "one clay CTA per screen"
   discipline intact; List Property stays ghost as specified.
2. **Coverage section (`/`) uses a stylized abstract SVG map, not MapLibre GL.**
   MapLibre needs a tile provider (API key + remote raster/vector tiles), which
   isn't available in this environment and arguably reintroduces "images" by
   another name. The dot/pulse/tooltip animation from the spec is implemented
   identically over the substitute map.
3. **Filters on `/properties` are client-side state, not URL search params.**
   There's no separate "filtered results" URL to canonicalize (Audit I4 is
   N/A as a result) — a production build would likely want filters reflected
   in the URL for shareability and back-button behaviour; noted as a gap, not
   implemented here.
4. **Several body copy blocks have no verbatim source.** The spec explicitly
   defers a handful of sections to "the content doc" that wasn't provided in
   this build's brief: the six owner FAQ answers, property-detail "About this
   home" body copy, the About page's "What we do"/timeline milestones/
   "Communities we manage"/"Careers" copy, and `/communities/residents`
   feature descriptions. These were authored to match the established tone
   rules and existing established facts (no invented statistics), and are
   flagged here rather than presented as spec-sourced.
5. **`/communities/residents` content** isn't specified as its own page in the
   spec's content section (only listed in the project structure and referenced
   as a link target) — it reuses the Communities page's "Residents" tab copy
   and resident feature table as a standalone page so the route isn't a 404.

## Project structure

Matches `HTC-BUILD-PROMPT.md` §3 with one addition: `components/ui/` holds
cross-page primitives introduced during the build that the spec didn't
enumerate individually — `Tabs`, `Accordion`, `Modal`, `FloatingField`,
`ListingCard` (the shared listing-card markup used by the homepage, search
results and similar-homes, so there's exactly one implementation instead of
three).
