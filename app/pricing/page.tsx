import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { PricingTables } from "@/components/sections/pricing/PricingTables";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Pricing — HTC",
  description: "Seekers pay nothing. Owner and community plans exist because some people want us to do the work, not because we put a wall in front of what should be free.",
};

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://www.htc.example/" },
          { name: "Pricing", url: "https://www.htc.example/pricing" },
        ])}
      />
      <PageHero
        eyebrow="Pricing"
        title="Seekers pay nothing. Everyone else pays for work, not access."
        subhead="No brokerage on any side of any transaction. Paid plans exist because some people want us to do the work, not because we put a wall in front of what should be free."
      />
      <PricingTables />
    </>
  );
}
