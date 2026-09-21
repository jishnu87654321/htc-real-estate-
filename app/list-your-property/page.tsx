import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { ListHero } from "@/components/sections/list-property/ListHero";
import { ListProblem } from "@/components/sections/list-property/ListProblem";
import { ListDifference } from "@/components/sections/list-property/ListDifference";
import { ListFreeAndPlans } from "@/components/sections/list-property/ListFreeAndPlans";
import { ListFlow } from "@/components/sections/list-property/ListFlow";
import { ListFAQAndCTA } from "@/components/sections/list-property/ListFAQAndCTA";

export const metadata: Metadata = {
  title: "List your property free — HTC",
  description: "List free, no brokerage. Your home goes in front of residents already living in communities HTC manages.",
};

export default function ListYourPropertyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://www.htc.example/" },
          { name: "List your property", url: "https://www.htc.example/list-your-property" },
        ])}
      />
      <ListHero />
      <ListProblem />
      <ListDifference />
      <ListFreeAndPlans />
      <ListFlow />
      <ListFAQAndCTA />
    </>
  );
}
