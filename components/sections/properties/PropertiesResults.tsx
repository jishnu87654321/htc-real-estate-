"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { Container } from "@/components/primitives/Container";
import { Button } from "@/components/primitives/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";
import { FilterRail, type Filters } from "@/components/sections/properties/FilterRail";
import { MobileFilterModal } from "@/components/ui/MobileFilterModal";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { duration, ease } from "@/lib/motion";

const ALL_LISTINGS: Listing[] = [
  { photoId: "properties-listing-01", slug: "sarvani-heights-3bhk", rent: "42,000", bhk: "3 BHK", area: "1,450", community: "Sarvani Heights", locality: "Gachibowli", verified: "2 days ago", htcManaged: true },
  { photoId: "properties-listing-02", slug: "lanco-hills-residencies-2bhk", rent: "28,500", bhk: "2 BHK", area: "1,100", community: "Lanco Hills Residencies", locality: "Manikonda", verified: "1 day ago", htcManaged: true },
  { photoId: "properties-listing-03", slug: "my-home-bhooja-3bhk", rent: "55,000", bhk: "3 BHK", area: "1,780", community: "My Home Bhooja", locality: "HITEC City", verified: "4 days ago", htcManaged: false },
  { photoId: "properties-listing-04", slug: "aparna-serene-park-1bhk", rent: "19,000", bhk: "1 BHK", area: "650", community: "Aparna Serene Park", locality: "Kondapur", verified: "Today", htcManaged: true },
  { photoId: "properties-listing-05", slug: "jayabheri-the-summit-2bhk", rent: "34,000", bhk: "2 BHK", area: "1,250", community: "Jayabheri The Summit", locality: "Nanakramguda", verified: "3 days ago", htcManaged: false },
  { photoId: "properties-listing-06", slug: "smr-vinay-iconia-4bhk", rent: "67,000", bhk: "4+ BHK", area: "2,100", community: "SMR Vinay Iconia", locality: "Kondapur", verified: "1 day ago", htcManaged: true },
  { photoId: "properties-listing-07", slug: "rajapushpa-atria-1bhk", rent: "24,000", bhk: "1 BHK", area: "600", community: "Rajapushpa Atria", locality: "Kokapet", verified: "5 days ago", htcManaged: true },
  { photoId: "properties-listing-08", slug: "candeur-landmark-3bhk", rent: "39,000", bhk: "3 BHK", area: "1,500", community: "Candeur Landmark", locality: "Financial District", verified: "2 days ago", htcManaged: false },
];

const SEARCH_TABS = [
  { id: "rent", label: "Rent" },
  { id: "buy", label: "Buy" },
  { id: "commercial", label: "Commercial" },
];

const SORTS = [
  { id: "relevance", label: "Relevance" },
  { id: "newest", label: "Newest first" },
  { id: "rent-asc", label: "Rent: low to high" },
  { id: "rent-desc", label: "Rent: high to low" },
  { id: "verified", label: "Verified most recently" },
];

const DEFAULT_FILTERS: Filters = { htcOnly: false, bhk: [], propertyType: [], furnishing: [], amenities: [], tenantPref: [], petFriendly: false, parking: false };

function parseRent(v: string) {
  return Number(v.replace(/,/g, ""));
}

export function PropertiesResults() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "buy" ? "buy" : "rent";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const results = useMemo(() => {
    let list = ALL_LISTINGS.filter((l) => {
      if (filters.htcOnly && !l.htcManaged) return false;
      if (filters.bhk.length && !filters.bhk.includes(l.bhk)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          l.community.toLowerCase().includes(q) ||
          l.locality.toLowerCase().includes(q) ||
          l.bhk.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
    if (sort === "rent-asc") list = [...list].sort((a, b) => parseRent(a.rent) - parseRent(b.rent));
    if (sort === "rent-desc") list = [...list].sort((a, b) => parseRent(b.rent) - parseRent(a.rent));
    return list;
  }, [filters, sort, searchQuery]);

  const htcCount = ALL_LISTINGS.filter((l) => l.htcManaged).length;
  const activeChips = [
    filters.htcOnly && "Only HTC-managed",
    searchQuery && `Search: "${searchQuery}"`,
    ...filters.bhk,
  ].filter(Boolean) as string[];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: results.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.htc.example/properties/${l.slug}`,
    })),
  };

  return (
    <section className="py-12">
      <JsonLd data={itemListSchema} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://www.htc.example/" },
        { name: "Properties", url: "https://www.htc.example/properties" },
      ])} />
      <Container>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-display-lg text-text-primary">Flats for rent in Hyderabad</h1>
            <p className="mt-3 text-body-lg text-text-secondary">
              {ALL_LISTINGS.length} homes ·{" "}
              <span className="font-semibold text-green-700">{htcCount} in communities HTC manages</span>
            </p>
          </div>

          {/* Properties Search Bar & Tabs (REV-11 §6 / L-04 fix) */}
          <div className="w-full lg:max-w-md flex flex-col gap-3">
            <Tabs tabs={SEARCH_TABS} active={activeTab} onChange={setActiveTab} layoutId="properties-search-tab" />
            <div className="flex items-center gap-3 rounded-full border border-border-strong bg-surface-raised px-4 py-2.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-red-600 focus-within:border-transparent">
              <Search className="h-4.5 w-4.5 text-text-tertiary shrink-0" />
              <input
                id="properties-search"
                data-search-input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by community or locality..."
                className="w-full bg-transparent text-body-sm text-text-primary placeholder:text-text-tertiary focus:outline-none border-none p-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search query"
                  onClick={() => setSearchQuery("")}
                  className="text-text-tertiary hover:text-text-primary p-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <motion.span
                key={chip}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={ease.spring}
                className="rounded-full bg-surface-sunken px-3 py-1 text-body-sm text-text-secondary"
              >
                {chip}
              </motion.span>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-full border border-border-strong px-4 py-2.5 text-body-sm font-medium"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <SortSelect sort={sort} onChange={setSort} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterRail filters={filters} onChange={setFilters} />
            </div>
          </aside>

          <div>
            <div className="hidden justify-end lg:flex">
              <SortSelect sort={sort} onChange={setSort} />
            </div>

            {results.length === 0 ? (
              <div className="mt-8 rounded-lg border border-dashed border-border-strong bg-surface-sunken p-10 text-center">
                <p className="font-serif text-display-sm text-text-primary">No homes match all of that.</p>
                <p className="mt-3 text-body-md text-text-secondary">
                  Try widening the budget by ₹[5,000], or removing a filter. You can also save this search and we
                  will message you when something opens up.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <Button type="button" variant="ghost" size="md" onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Clear filters
                  </Button>
                  <Button type="button" variant="primary" size="md">
                    Save this search
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div layout className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {results.map((listing) => (
                    <motion.div
                      key={listing.photoId}
                      layout
                      initial={false}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ListingCard listing={listing} layout />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </Container>

      <MobileFilterModal open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        <div className="flex items-center justify-between">
          <h2 className="text-title-lg font-semibold text-text-primary">Filters</h2>
          <button type="button" aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-4">
          <FilterRail filters={filters} onChange={setFilters} />
        </div>
        <Button type="button" variant="primary" size="lg" className="mt-4 w-full" onClick={() => setMobileFiltersOpen(false)}>
          Show {results.length} homes
        </Button>
      </MobileFilterModal>
    </section>
  );
}

function SortSelect({ sort, onChange }: { sort: string; onChange: (v: string) => void }) {
  return (
    <select
      value={sort}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sort results"
      className="rounded-full border border-border-strong bg-surface-raised px-4 py-2.5 text-body-sm font-medium text-text-primary"
    >
      {SORTS.map((s) => (
        <option key={s.id} value={s.id}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
