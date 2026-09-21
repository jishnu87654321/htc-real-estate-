import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ContactRoutes } from "@/components/sections/contact/ContactRoutes";
import { ContactInfo } from "@/components/sections/contact/ContactInfo";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Contact HTC",
  description: "Reach HTC as a seeker, an owner or a committee — plus phone, WhatsApp, email and the grievance officer.",
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://www.htc.example/" },
          { name: "Contact", url: "https://www.htc.example/contact" },
        ])}
      />
      <PageHero title="Talk to someone who actually knows" />
      <ContactRoutes />
      <ContactInfo />
    </>
  );
}
