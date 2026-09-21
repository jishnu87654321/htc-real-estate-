# HTC — Scroll Sequences Documentation

## 1. Overview

In Revision 01, all heavy Three.js / WebGL 3D scenes across the HTC website were replaced with high-performance, scroll-driven image sequences. This improves load times, eliminates GPU overhead, delivers consistent 60fps animations across mobile and low-powered devices, and provides an immediate drop-in path for photography.

---

## 2. Architecture & Components

### 2.1 `<SequenceShell>`

Located at `components/primitives/SequenceShell.tsx`.
Acts as the protective container for sequence rendering:
1. **Zero-CLS aspect ratio reservation**: Holds container dimensions via CSS `aspectRatio` before scripts or assets load.
2. **IntersectionObserver lazy-mounting**: Only mounts active sequence drivers when within `300px` of the viewport.
3. **Data-Saver & Reduced Motion compliance**: Automatically serves a single static fallback poster on `prefers-reduced-motion` or `navigator.connection.saveData`.
4. **React Error Boundary**: Gracefully isolates runtime rendering issues to fall back to a static frame without crashing the route.

### 2.2 `<ScrollSequence>`

Located at `components/primitives/ScrollSequence.tsx`.

#### TypeScript API
```tsx
export interface SequenceFrame {
  id?: string;        // e.g. "home-hero-seq-01"
  label: string;      // Photographer instruction
  caption?: string;   // Optional on-image caption
  chip?: string;      // Interactive module label for filmstrip
}

export interface ScrollSequenceProps {
  id: string;                    // Base ID (frames get -01, -02...)
  frames: SequenceFrame[];       // 3–8 frames
  mode?: "crossfade" | "stack" | "filmstrip"; // Default: "crossfade"
  ratio?: string;                // Default "4/5" desktop, "4/3" mobile
  sticky?: boolean;              // Default true
  progress?: MotionValue<number>;// Optional external scroll driver
  caption?: boolean;             // Default true
  activeFrameIndex?: number;     // Externally driven frame index
  onFrameSelect?: (index: number) => void;
  className?: string;
  autoPlayInterval?: number;     // Interval ms for timer crossfade (e.g. Hero)
}
```

---

## 3. The Three Sequence Modes

### 3.1 `crossfade` (Default)
- **Placements**: Homepage Hero (`home-hero-seq`), Homepage Difference (`home-difference-seq`), Property Detail Rooms (`detail-rooms-seq`).
- **Behavior**: Frames stack absolutely. Scroll progress `[0 → 1]` is divided into $N$ equal bands. Incoming frames crossfade with a subtle scale (`0.97 → 1.0`), while outgoing frames fade to 0 (`1.0 → 1.03`).
- **Bands Overlap**: 20% overlap ensures seamless progression without blank frames, creating a scrubbed video feel.

### 3.2 `stack`
- **Placements**: List Your Property Hero (`owners-seq`).
- **Behavior**: Frames translate upwards and settle in a physical card stack (`y: 40px → 0px`, `rotate: 1.5deg → 0deg`, `scale: 0.95 → 1.0`).

### 3.3 `filmstrip`
- **Placements**: Communities Hero (`communities-seq`).
- **Behavior**: A single vertical column translating at an accelerated parallax rate.
- **Hover Chips**: Hovering frames reveals interactive feature badges (`Visitor management`, `Facility booking`, etc.).

---

## 4. Mobile & Accessibility Specifications

- **Mobile Viewport (< 768px)**: Native sticky and scroll-jacking are completely disabled. Renders as a native momentum horizontal snap-scroll carousel with dot indicators.
- **Reduced Motion**: Renders frame 01 as a static image without any animation or transition overhead.

---

## 5. Transitioning to Real Photography

To transition from placeholder frames to high-resolution photography:
1. Deposit images in `/public/images/sequences/[id]-[index].webp`.
2. Inside `components/primitives/ScrollSequence.tsx`, replace the `<Placeholder>` component with Next.js `<Image>`:
```tsx
import Image from "next/image";

// Replace:
// <Placeholder id={frameId} ratio={ratio} label={frame.label} />
// With:
<Image
  src={`/images/sequences/${frameId}.webp`}
  alt={frame.label}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover rounded-lg"
  priority={i === 0}
/>
```

---

## 6. Documented Future Option: `<ScrollVideo>`

For situations where compressed video is preferred over frame sequences:

### Specification
- Render a single `<video>` element with `currentTime` mapped directly to `scrollYProgress`:
```tsx
const { scrollYProgress } = useScroll({ target: containerRef });
useEffect(() => {
  return scrollYProgress.on("change", (v) => {
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = v * videoRef.current.duration;
    }
  });
}, [scrollYProgress]);
```

### Constraints & Caveats
- **Encoding Requirements**: Requires fragmented MP4 (`faststart`) or WebM with dense keyframes (every 2-4 frames) to prevent seek lag.
- **iOS Safari Constraints**: iOS throttles video frame decoding when seeking unplayed video, resulting in stutter unless hardware decoded with specific profile levels.
- **Payload Budget**: Video files must strictly remain under 2.0 MB to be viable over 4G mobile networks.
- **Current Recommendation**: Image sequences remain the superior solution for instantaneous scrub response, predictable memory usage, and crisp typography rendering.
