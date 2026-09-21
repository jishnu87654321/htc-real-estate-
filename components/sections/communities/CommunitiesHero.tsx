"use client";

import { Container } from "@/components/primitives/Container";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { ThumbnailCarousel } from "@/components/ui/ThumbnailCarousel";
import { COMMUNITIES_SLIDES } from "@/lib/communities/carousel-slides";

export function CommunitiesHero() {
  return (
    <section className="pt-12 pb-16 md:pt-20 md:pb-24">
      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        {/* Left Column: Copy & Actions (Desktop order 1, Mobile order 2) */}
        <div className="order-2 lg:order-1 lg:col-span-6">
          <h1 className="max-w-xl font-serif text-display-lg text-text-primary">
            Run the community from one place
          </h1>
          <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">
            Maintenance billing, dues, visitors, complaints, notices, facilities and vendors — in one system that
            residents, guards and the committee all see. Instead of a WhatsApp group, a paper register and three
            spreadsheets.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/contact" variant="primary" size="lg">
              Book a walkthrough
            </Button>
            <Button href="/communities/residents" variant="ghost" size="lg">
              See what residents get
            </Button>
          </div>
          <p className="mt-6 text-body-sm text-text-tertiary">
            120 communities · 38,000 residents · ₹18 crore in maintenance collected on the platform
          </p>
        </div>

        {/* Right Column: Shared Thumbnail Carousel with Captions (Desktop order 2, Mobile order 1) */}
        <div className="order-1 lg:order-2 lg:col-span-6 flex justify-center w-full">
          <ThumbnailCarousel
            slides={COMMUNITIES_SLIDES}
            label="Community photos"
            showCaption={true}
            className="w-full"
          />
        </div>
      </Container>
    </section>
  );
}
