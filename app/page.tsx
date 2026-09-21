import { JsonLd, organizationSchema, websiteSchema } from "@/components/seo/JsonLd";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { Difference } from "@/components/sections/Difference";
import { FeaturedHomes } from "@/components/sections/FeaturedHomes";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ForOwners } from "@/components/sections/ForOwners";
import { HomeCommunities } from "@/components/sections/HomeCommunities";
import { InternalComms } from "@/components/sections/InternalComms";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { Coverage } from "@/components/sections/Coverage";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <Hero />
      <TrustStrip />
      <Difference />
      <FeaturedHomes />
      <HowItWorks />
      <ForOwners />
      <HomeCommunities />
      <InternalComms />
      <Services />
      <Testimonials />
      <Coverage />
      <FAQ />
      <FinalCTA />
    </>
  );
}
