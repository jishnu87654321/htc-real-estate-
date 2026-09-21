"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Placeholder } from "@/components/primitives/Placeholder";
import { duration, stagger, useRevealMotion, useReducedMotion } from "@/lib/motion";
import availableImagesList from "@/lib/available-images.json";

// Index available images for fast lookup
const imageMap: Record<string, string> = {};
for (const item of availableImagesList as Array<{ id: string; path: string }>) {
  imageMap[item.id] = item.path;
}

interface TileData {
  id: string;
  title: string;
  body: string;
  photoAlt: string;
}

const TILES: TileData[] = [
  {
    id: "home-feature-01",
    title: "Maintenance billing",
    body: "Automated invoices, unit-wise, GST-ready, raised on schedule",
    photoAlt: "Bright apartment corridor with flat doors and soft daylight",
  },
  {
    id: "home-feature-02",
    title: "Dues and collections",
    body: "Who has paid, who has not, chased automatically",
    photoAlt: "Community lobby with mailboxes in soft afternoon light",
  },
  {
    id: "home-feature-03",
    title: "Visitor and gate entry",
    body: "Every entry logged, every guest approved from the resident's phone",
    photoAlt: "Community entrance gate and security cabin in daylight",
  },
  {
    id: "home-feature-04",
    title: "Complaints desk",
    body: "Raised, assigned, tracked and closed with a timestamp",
    photoAlt: "Facility technician hands working on switchboard in natural light",
  },
  {
    id: "home-feature-05",
    title: "Notices and polls",
    body: "One notice board every resident actually sees",
    photoAlt: "Community hall interior in warm soft light",
  },
  {
    id: "home-feature-06",
    title: "Vendors and staff",
    body: "Contracts, attendance and payments in one ledger",
    photoAlt: "Maintenance staff walking a landscaped podium",
  },
];

const COLS = 3;

function FeatureTile({
  tile,
  index,
}: {
  tile: TileData;
  index: number;
}) {
  const row = Math.floor(index / COLS);
  const col = index % COLS;

  const revealProps = useRevealMotion({
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
    transition: { duration: duration.slow, delay: (row + col) * stagger.tight },
    viewport: { once: true, amount: 0.2 },
  });

  const imageSrc = imageMap[tile.id] || `/sequences/${tile.id}.jpg`;

  return (
    <motion.article
      data-feature-tile
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      {...revealProps}
    >
      {/* ── Media Header: 16:10 Clean Full Photography ────── */}
      <div
        data-tile-media
        className="relative w-full aspect-[16/10] overflow-hidden rounded-t-2xl bg-surface-sunken"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={tile.photoAlt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-104"
          />
        ) : (
          <Placeholder
            id={tile.id}
            ratio="16/10"
            label={tile.photoAlt}
            className="w-full h-full"
          />
        )}
      </div>

      {/* ── Tile Body (Verbatim copy) ────────────────────────────────────── */}
      <div data-tile-body className="flex flex-col justify-between flex-1 p-6">
        <div>
          <h3 className="text-title-lg font-semibold text-text-primary">
            {tile.title}
          </h3>
          <p className="mt-2 text-body-md text-text-secondary leading-relaxed">
            {tile.body}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export function HomeCommunities() {
  return (
    <Section>
      <Container>
        <Badge variant="red">For societies and RWAs</Badge>
        <Reveal>
          <h2 className="mt-6 max-w-3xl font-serif text-display-md text-text-primary">
            Run the whole community from one place — not a WhatsApp group, a paper register and three spreadsheets.
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">
            Maintenance billing, dues collection, visitor entry, complaints, notices, facility booking and vendor
            payments in a single system. Residents, guards and the committee all see the same information, and every
            rupee is on record.
          </p>
        </Reveal>

        <div
          data-feature-grid
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TILES.map((tile, i) => (
            <FeatureTile
              key={tile.id}
              tile={tile}
              index={i}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Button href="/communities" variant="primary" size="lg">
            Book a walkthrough
          </Button>
          <Button href="/communities" variant="ghost" size="lg">
            See how communities use HTC
          </Button>
        </div>
      </Container>
    </Section>
  );
}
