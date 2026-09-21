import type { Metadata } from "next";
import { Container } from "@/components/primitives/Container";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { PropertyGallery } from "@/components/sections/property-detail/PropertyGallery";
import { PropertyHeadline, VerificationCard, KeyFacts } from "@/components/sections/property-detail/PropertyOverview";
import { PropertyAbout } from "@/components/sections/property-detail/PropertyAbout";
import { PropertyFloorPlan } from "@/components/sections/property-detail/PropertyFloorPlan";
import { PropertyCommunity } from "@/components/sections/property-detail/PropertyCommunity";
import { CostCalculator } from "@/components/sections/property-detail/CostCalculator";
import { PropertyLocation } from "@/components/sections/property-detail/PropertyLocation";
import { SimilarHomes } from "@/components/sections/property-detail/SimilarHomes";
import { StickyContactBar } from "@/components/sections/property-detail/StickyContactBar";

export const metadata: Metadata = {
  title: "3 BHK for rent in Sarvani Heights, Gachibowli — HTC",
  description: "Verified by the facility manager on site. No brokerage. Maintenance shown separately, always.",
};

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: "3 BHK for rent in Sarvani Heights, Gachibowli",
    numberOfRooms: "3",
    floorSize: { "@type": "QuantitativeValue", value: "1450", unitCode: "FTK" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gachibowli",
      addressRegion: "Hyderabad",
      addressCountry: "IN",
    },
    offers: {
      "@type": "Offer",
      price: "42000",
      priceCurrency: "INR",
    },
  };

  return (
    <div className="pb-24 pt-10 lg:pb-16">
      <JsonLd data={listingSchema} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://www.htc.example/" },
          { name: "Properties", url: "https://www.htc.example/properties" },
          { name: slug, url: `https://www.htc.example/properties/${slug}` },
        ])}
      />
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-12">
            <PropertyGallery />
            <PropertyHeadline />
            <VerificationCard />
            <KeyFacts />
            <PropertyAbout />
            <PropertyFloorPlan />
            <PropertyCommunity />
            <CostCalculator />
            <PropertyLocation />
            <SimilarHomes />
          </div>
          <div>
            <StickyContactBar />
          </div>
        </div>
      </Container>
    </div>
  );
}
