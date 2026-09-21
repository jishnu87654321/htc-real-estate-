import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd, faqSchema } from "@/components/seo/JsonLd";

const ITEMS = [
  {
    question: "Do I pay HTC anything as a tenant or buyer?",
    answer:
      "No. Seekers pay nothing — no brokerage, no platform fee, no charge to contact an owner. We earn from owner plans, community subscriptions and services you choose to book.",
  },
  {
    question: "What does verified actually mean here?",
    answer:
      "A named member of the facility team confirmed the home exists, is available, and matches the photos. The date of that check is on every listing.",
  },
  {
    question: "Does my society have to be on HTC for me to use it?",
    answer: "No. Anyone can search and contact owners. Homes inside HTC communities simply carry more verified information.",
  },
  {
    question: "How is this different from other property portals?",
    answer:
      "They list whatever is uploaded. We manage the buildings the homes are in, so the information comes from our own operations rather than from a poster.",
  },
  {
    question: "Will you sell my phone number to agents?",
    answer: "No. Your contact details go to the owner of the home you enquired about, and nowhere else.",
  },
  {
    question: "What does it cost to list my property?",
    answer: "Listing is free and stays free. Paid plans add tenant screening, rent collection and full property management.",
  },
  {
    question: "How long does it take to get a tenant?",
    answer:
      "Homes in communities we manage are tenanted in 14 days on average. Homes outside take longer and we will tell you honestly what to expect.",
  },
  {
    question: "Can our society use HTC without moving our accounts?",
    answer: "Yes. Start with visitor entry and communication, and bring billing across whenever the committee is ready.",
  },
  {
    question: "What happens to our data if we leave?",
    answer: "It is yours. Export every ledger, resident record and document at any time, in a standard format, without asking us.",
  },
  {
    question: "Do residents have to install anything?",
    answer:
      "Residents get an app; guards get a device at the gate. Residents without a smartphone can be managed by the committee from the console.",
  },
];

export function FAQ() {
  return (
    <Section className="bg-surface-page">
      <JsonLd data={faqSchema(ITEMS)} />
      <Container className="max-w-3xl">
        <Reveal>
          <h2 className="text-center font-serif text-display-md text-text-primary">Frequently asked questions</h2>
        </Reveal>
        <div className="mt-12">
          <Accordion items={ITEMS} groupName="home-faq" />
        </div>
      </Container>
    </Section>
  );
}
