import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { AboutIntro, AboutMoney, AboutCommunitiesCareers, AboutTeam } from "@/components/sections/about/AboutSections";
import { AboutTimeline } from "@/components/sections/about/AboutTimeline";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About HTC",
  description: "HTC started by running buildings, not listing them. Here is how that shaped the platform, and how we make money.",
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://www.htc.example/" },
          { name: "About", url: "https://www.htc.example/about" },
        ])}
      />
      <PageHero title="We started by running buildings, not listing them" />
      <AboutIntro />
      <AboutTimeline />
      <AboutMoney />
      <AboutTeam />
      <AboutCommunitiesCareers />
    </>
  );
}
