import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/primitives/Button";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "For residents — HTC",
  description: "Approve visitors, pay maintenance, raise complaints and book the clubhouse — all from your phone, in a building HTC manages.",
};

const FEATURES = [
  { label: "Visitor approval", body: "Approve guests and deliveries from your phone before they reach the gate" },
  { label: "Maintenance payments", body: "Pay dues online, see your full payment history" },
  { label: "Complaints", body: "Raise an issue and track it to close, with timestamps" },
  { label: "Notices and polls", body: "Read every notice and vote in every poll from one feed" },
  { label: "Facility booking", body: "Book the clubhouse, courts or party hall in a few taps" },
  { label: "Documents", body: "Bye-laws, AGM minutes and your own agreements, always available" },
  { label: "Resident directory", body: "Know who lives in your building, with committee-set visibility" },
  { label: "Emergency alerts", body: "One tap reaches the guard, the manager and your family contact" },
  { label: "Homes in your building", body: "Listings from inside your own community, first", emphasis: true },
];

export default function CommunitiesResidentsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://www.htc.example/" },
          { name: "Communities", url: "https://www.htc.example/communities" },
          { name: "Residents", url: "https://www.htc.example/communities/residents" },
        ])}
      />
      <PageHero
        eyebrow="For residents"
        title="Your building, on your phone"
        subhead="Approve visitors before they reach the gate, pay maintenance without a reminder, raise a complaint and watch it actually move, book the clubhouse, read notices that are not buried in a group chat."
      >
        <div className="mt-8">
          <Button href="/contact" variant="primary" size="lg">
            Ask your committee about HTC
          </Button>
        </div>
      </PageHero>

      <Section className="bg-surface-sunken">
        <Container>
          <Reveal stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className={`rounded-lg border p-5 ${f.emphasis ? "border-clay-500 border-l-4 bg-clay-100" : "border-border-subtle bg-surface-raised"}`}
              >
                <p className="text-title-md font-semibold text-text-primary">{f.label}</p>
                <p className="mt-1 text-body-sm text-text-secondary">{f.body}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
