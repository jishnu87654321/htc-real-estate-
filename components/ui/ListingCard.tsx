"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Placeholder } from "@/components/primitives/Placeholder";
import { duration } from "@/lib/motion";

export interface Listing {
  /** Fully-qualified, unique placeholder ID — must match a docs/IMAGE-MANIFEST.md row */
  photoId: string;
  /** URL slug for the detail page link */
  slug: string;
  rent: string;
  bhk: string;
  area: string;
  community: string;
  locality: string;
  verified: string;
  htcManaged: boolean;
}

export function ListingCard({ listing, layout = false }: { listing: Listing; layout?: boolean }) {
  return (
    <motion.div
      layout={layout}
      data-listing-card
      className="group rounded-xl border border-border-subtle bg-surface-raised shadow-sm transition-colors hover:border-paper-300"
      whileHover="hover"
      initial="rest"
      animate="rest"
      variants={{
        rest: { y: 0, boxShadow: "var(--shadow-sm)" },
        hover: { y: -4, boxShadow: "var(--shadow-lg)" },
      }}
      transition={{ duration: duration.base }}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <motion.div variants={{ rest: { scale: 1 }, hover: { scale: 1.03 } }} transition={{ duration: duration.base }}>
          <Placeholder id={listing.photoId} ratio="4/3" label="Interior of listed flat, wide, natural light" />
        </motion.div>
        {/* Verification badge switched to green family */}
        <motion.span
          className="absolute left-3 top-3 rounded-full border border-green-200 bg-green-100 px-3 py-1 text-label uppercase tracking-[0.08em] font-semibold text-green-700 shadow-sm backdrop-blur-sm"
          variants={{ rest: { y: 0 }, hover: { y: -2 } }}
          transition={{ duration: duration.base }}
        >
          Verified {listing.verified}
        </motion.span>
        {listing.htcManaged && (
          <span className="absolute right-3 top-3 rounded-full bg-ink-900/90 px-3 py-1 text-label uppercase tracking-[0.08em] font-medium text-white shadow-sm">
            HTC-managed
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="font-sans text-price font-bold tabular-nums text-text-primary">₹{listing.rent}/month</p>
        <p className="mt-1 text-body-sm text-text-secondary">
          {listing.bhk} · {listing.area} sq ft
        </p>
        <h2 className="mt-3 text-title-md font-semibold text-text-primary">{listing.community}</h2>
        <p className="text-body-sm text-text-tertiary">{listing.locality}</p>
        <Link
          href={`/properties/${listing.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-body-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
        >
          View home <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
