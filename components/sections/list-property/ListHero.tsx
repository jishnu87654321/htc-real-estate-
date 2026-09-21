"use client";

import { Container } from "@/components/primitives/Container";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { ThumbnailCarousel } from "@/components/ui/ThumbnailCarousel";
import { OWNER_CAROUSEL_SLIDES } from "@/lib/owners/carousel-slides";

export function ListHero() {
  return (
    <section className="pt-12 pb-16 md:pt-20 md:pb-24">
      <Container className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        {/* Left Column: Copy & Actions (Desktop order 1, Mobile order 2) */}
        <div className="order-2 lg:order-1 lg:col-span-6">
          <h1 className="max-w-xl font-serif text-display-lg text-text-primary">
            Your next tenant already lives in a community we manage.
          </h1>
          <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">
            List in 4 minutes. Your home goes in front of 38,000 residents whose identity and rental history are
            already on the platform — and most of ours are tenanted before they are ever advertised publicly.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/list-your-property#start" variant="primary" size="lg">
              List your property free
            </Button>
            <Button href="/pricing" variant="ghost" size="lg">
              See how pricing works →
            </Button>
          </div>
          <p className="mt-4 text-body-sm text-text-tertiary">
            No card needed. No sales call unless you ask for one.
          </p>
        </div>

        {/* Right Column: Hardened Thumbnail Carousel (Desktop order 2, Mobile order 1) */}
        <div className="order-1 lg:order-2 lg:col-span-6 flex justify-center w-full">
          <ThumbnailCarousel
            slides={OWNER_CAROUSEL_SLIDES}
            label="Property listing overview"
            className="w-full"
          />
        </div>
      </Container>
    </section>
  );
}
