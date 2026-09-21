import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/primitives/Button";
import { JsonLd, faqSchema } from "@/components/seo/JsonLd";

const ITEMS = [
  {
    question: "Is it really free?",
    answer:
      "Yes. Listing is free and stays free. You only pay if you choose Assisted or Managed, and that is for work we do, not for access to list.",
  },
  {
    question: "Who sees my number?",
    answer: "Only HTC and, if you choose to share it, the tenant you approve. We do not sell your number to agents.",
  },
  {
    question: "What if I am not in an HTC community?",
    answer:
      "You can still list for free. You will not carry the verified badge or reach the resident pool the same way, but screening, agreements and support work the same.",
  },
  {
    question: "How do you screen tenants?",
    answer:
      "For residents already on HTC, we check their platform history — maintenance payments, complaints, past handovers. For everyone else, we run standard identity and background checks.",
  },
  {
    question: "What if the tenant stops paying?",
    answer:
      "On the Managed plan, we handle collection and follow-up on your behalf. On Free and Assisted, the agreement we draft sets out the process, and we can advise on next steps.",
  },
  {
    question: "Can I take the listing down?",
    answer: "Yes, any time, from your dashboard. There is no notice period and no fee.",
  },
];

export function ListFAQAndCTA() {
  return (
    <>
      <Section className="bg-surface-page">
        <JsonLd data={faqSchema(ITEMS)} />
        <Container className="max-w-3xl">
          <Reveal>
            <h2 className="text-center font-serif text-display-md text-text-primary">Owner questions</h2>
          </Reveal>
          <div className="mt-12">
            <Accordion items={ITEMS} groupName="owner-faq" />
          </div>
        </Container>
      </Section>

      <section className="bg-red-600 py-[clamp(5rem,10vw,10rem)] text-white shadow-inner">
        <Container className="text-center">
          <Reveal>
            <h2 className="font-serif text-display-md text-white font-bold">4 minutes now, or another empty month</h2>
          </Reveal>
          <div className="mt-10 flex justify-center">
            <Button href="#start" variant="inverse-ghost" size="lg">
              List your property free
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
