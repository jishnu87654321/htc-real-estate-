export interface CarouselCaption {
  label: string;
  detail: string;
}

export interface CarouselSlide {
  id: string;
  alt: string;
  focal?: { x: number; y: number };
  caption?: CarouselCaption;
}

export const COMMUNITIES_SLIDES: CarouselSlide[] = [
  {
    id: "communities-carousel-01",
    alt: "Community gate with security cabin",
    focal: { x: 0.5, y: 0.5 },
    caption: {
      label: "Visitor management",
      detail: "Every guest approved from the resident's phone",
    },
  },
  {
    id: "communities-carousel-02",
    alt: "Residents in the community clubhouse",
    focal: { x: 0.5, y: 0.5 },
    caption: {
      label: "Facility booking",
      detail: "Clubhouse, courts and halls — no double bookings",
    },
  },
  {
    id: "communities-carousel-03",
    alt: "Facility manager at the community office",
    focal: { x: 0.5, y: 0.5 },
    caption: {
      label: "Operations console",
      detail: "Every complaint assigned, tracked and closed",
    },
  },
  {
    id: "communities-carousel-04",
    alt: "Committee members meeting",
    focal: { x: 0.5, y: 0.5 },
    caption: {
      label: "Committee workspace",
      detail: "Decisions and approvals, on record",
    },
  },
  {
    id: "communities-carousel-05",
    alt: "A resident using the community app",
    focal: { x: 0.5, y: 0.5 },
    caption: {
      label: "Resident app",
      detail: "Dues, notices and requests in one place",
    },
  },
];
