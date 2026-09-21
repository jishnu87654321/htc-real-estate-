import thumbnails from "./hero-thumbnails.json";

export interface HeroSlide {
  id: string;
  image: string;
  bgSrc: string;     // pre-blurred background WebP (built by scripts/build-hero-bg.mjs)
  thumbnail: string; // 48px data-URI for internal use
  alt: string;
  tag: string;
  line: string;
  focal: { x: number; y: number };
  avgColor: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "home-hero-seq-01",
    image: "/sequences/home-hero-seq-01.jpg",
    bgSrc: "/sequences/bg/home-hero-seq-01.webp",
    thumbnail: (thumbnails as Record<string, string>)["home-hero-seq-01"] || "",
    alt: "Community exterior, wide, golden hour, low angle",
    tag: "Managed by HTC",
    line: "HTC manages 120 residential communities. We know which homes are free before any of it reaches a listing site.",
    focal: { x: 0.55, y: 0.45 },
    avgColor: "rgb(129, 113, 91)",
  },
  {
    id: "home-hero-seq-02",
    image: "/sequences/home-hero-seq-02.jpg",
    bgSrc: "/sequences/bg/home-hero-seq-02.webp",
    thumbnail: (thumbnails as Record<string, string>)["home-hero-seq-02"] || "",
    alt: "Entrance gate with security cabin, morning light",
    tag: "Verified at the gate",
    line: "Every listing is confirmed by the facility team who work in that building — with a name and a date on the check.",
    focal: { x: 0.52, y: 0.48 },
    avgColor: "rgb(115, 122, 106)",
  },
  {
    id: "home-hero-seq-03",
    image: "/sequences/home-hero-seq-03.jpg",
    bgSrc: "/sequences/bg/home-hero-seq-03.webp",
    thumbnail: (thumbnails as Record<string, string>)["home-hero-seq-03"] || "",
    alt: "Bright empty living room, natural light, wide",
    tag: "The real cost, upfront",
    line: "Rent, deposit and the actual maintenance charge, on every listing. No estimates, no surprises at signing.",
    focal: { x: 0.50, y: 0.45 },
    avgColor: "rgb(169, 163, 150)",
  },
  {
    id: "home-hero-seq-04",
    image: "/sequences/home-hero-seq-04.jpg",
    bgSrc: "/sequences/bg/home-hero-seq-04.webp",
    thumbnail: (thumbnails as Record<string, string>)["home-hero-seq-04"] || "",
    alt: "Residents in a shared courtyard or clubhouse",
    tag: "Move in, already set up",
    line: "Gate pass, maintenance account and resident profile — ready on the same platform before you get the keys.",
    focal: { x: 0.50, y: 0.46 },
    avgColor: "rgb(101, 91, 65)",
  },
];
