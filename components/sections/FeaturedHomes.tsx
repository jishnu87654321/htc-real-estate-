import Link from "next/link";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";

const LISTINGS: Listing[] = [
  { photoId: "home-featured-01", slug: "sarvani-heights-3bhk", rent: "42,000", bhk: "3 BHK", area: "1,450", community: "Sarvani Heights", locality: "Gachibowli", verified: "2 days ago", htcManaged: true },
  { photoId: "home-featured-02", slug: "lanco-hills-residencies-2bhk", rent: "28,500", bhk: "2 BHK", area: "1,100", community: "Lanco Hills Residencies", locality: "Manikonda", verified: "1 day ago", htcManaged: true },
  { photoId: "home-featured-03", slug: "my-home-bhooja-3bhk", rent: "55,000", bhk: "3 BHK", area: "1,780", community: "My Home Bhooja", locality: "HITEC City", verified: "4 days ago", htcManaged: true },
  { photoId: "home-featured-04", slug: "aparna-serene-park-1bhk", rent: "19,000", bhk: "1 BHK", area: "650", community: "Aparna Serene Park", locality: "Kondapur", verified: "Today", htcManaged: true },
  { photoId: "home-featured-05", slug: "jayabheri-the-summit-2bhk", rent: "34,000", bhk: "2 BHK", area: "1,250", community: "Jayabheri The Summit", locality: "Nanakramguda", verified: "3 days ago", htcManaged: true },
  { photoId: "home-featured-06", slug: "smr-vinay-iconia-4bhk", rent: "67,000", bhk: "4+ BHK", area: "2,100", community: "SMR Vinay Iconia", locality: "Kondapur", verified: "1 day ago", htcManaged: true },
];

export function FeaturedHomes() {
  return (
    <Section>
      <Container>
        <Reveal>
          <h2 className="font-serif text-display-md text-text-primary">Available now, in communities we manage</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-4 max-w-[52ch] text-body-lg text-text-secondary">
            Every one of these was confirmed this week by the team on site.
          </p>
        </Reveal>

        <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LISTINGS.map((listing) => (
            <ListingCard key={listing.photoId} listing={listing} />
          ))}
        </Reveal>

        <div className="mt-12 text-center">
          <Link href="/properties" className="text-body-lg font-medium text-clay-600 hover:text-clay-700">
            See all 1,240 homes →
          </Link>
        </div>
      </Container>
    </Section>
  );
}
