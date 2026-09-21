export interface CarouselSlide {
  id: string;
  alt: string;
  focal?: { x: number; y: number };
}

export const OWNER_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: "owners-carousel-01",
    alt: "Empty bright living room ready to let",
    focal: { x: 0.5, y: 0.5 },
  },
  {
    id: "owners-carousel-02",
    alt: "The same living room, furnished",
    focal: { x: 0.5, y: 0.5 },
  },
  {
    id: "owners-carousel-03",
    alt: "Facility team verifying a home",
    focal: { x: 0.5, y: 0.5 },
  },
  {
    id: "owners-carousel-04",
    alt: "Owner reviewing enquiries on a phone",
    focal: { x: 0.5, y: 0.5 },
  },
  {
    id: "owners-carousel-05",
    alt: "Keys handed over to a new tenant",
    focal: { x: 0.5, y: 0.5 },
  },
];
