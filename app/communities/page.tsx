import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { CommunitiesHero } from "@/components/sections/communities/CommunitiesHero";
import { WhoItsFor } from "@/components/sections/communities/WhoItsFor";
import { WhatItDoes } from "@/components/sections/communities/WhatItDoes";
import { Migration } from "@/components/sections/communities/Migration";
import { ResidentAppAndCTA } from "@/components/sections/communities/ResidentAppAndCTA";

export const metadata: Metadata = {
  title: "Community management software — HTC",
  description: "Maintenance billing, dues, visitors, complaints and vendors in one system. Built for RWAs, committees and facility teams.",
};

export default function CommunitiesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://www.htc.example/" },
          { name: "Communities", url: "https://www.htc.example/communities" },
        ])}
      />
      <CommunitiesHero />
      <WhoItsFor />
      <WhatItDoes />
      <Migration />
      <ResidentAppAndCTA />
    </>
  );
}
