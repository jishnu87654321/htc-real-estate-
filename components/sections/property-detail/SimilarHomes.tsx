import { Reveal } from "@/components/primitives/Reveal";
import { ListingCard, type Listing } from "@/components/ui/ListingCard";

const SIMILAR: Listing[] = [
  { photoId: "detail-similar-1", slug: "sarvani-heights-tower-b-3bhk", rent: "45,000", bhk: "3 BHK", area: "1,520", community: "Sarvani Heights · Tower B", locality: "Gachibowli", verified: "1 day ago", htcManaged: true },
  { photoId: "detail-similar-2", slug: "sarvani-heights-tower-c-2bhk", rent: "32,000", bhk: "2 BHK", area: "1,180", community: "Sarvani Heights · Tower C", locality: "Gachibowli", verified: "3 days ago", htcManaged: true },
  { photoId: "detail-similar-3", slug: "sarvani-heights-penthouse", rent: "68,000", bhk: "4 BHK", area: "2,250", community: "Sarvani Heights · Sky Villa", locality: "Gachibowli", verified: "Today", htcManaged: true },
];

export function SimilarHomes() {
  return (
    <div>
      <h2 className="font-serif text-display-sm text-text-primary">Similar homes in this community</h2>
      <Reveal stagger className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {SIMILAR.map((listing) => (
          <ListingCard key={listing.photoId} listing={listing} />
        ))}
      </Reveal>
    </div>
  );
}
