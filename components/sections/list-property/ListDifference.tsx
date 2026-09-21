import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";

const CARDS = [
  {
    n: "01",
    title: "A pool, not a crowd",
    body: "Your listing goes first to residents already inside HTC communities — people with a platform record, not a stranger with a screenshot.",
  },
  {
    n: "02",
    title: "Screening from real history",
    body: "We check the platform's own record: how they paid maintenance, whether complaints were raised, how the last handover went. Not a self-declared form.",
  },
  {
    n: "03",
    title: "Your number stays yours",
    body: "Enquiries come through HTC. You choose who gets to call you.",
  },
  {
    n: "04",
    title: "Someone is actually there",
    body: "If your flat is in a community we manage, our on-site team handles the visit, the photos and the handover — even if you are in another city.",
  },
];

export function ListDifference() {
  return (
    <Section>
      <Container>
        <Reveal>
          <h2 className="font-serif text-display-md text-text-primary">We already know your tenant</h2>
        </Reveal>
        <Reveal stagger className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {CARDS.map((card) => (
            <div key={card.n} className="rounded-lg border border-border-subtle bg-surface-raised p-6">
              <span className="font-serif text-display-sm text-clay-600">{card.n}</span>
              <h3 className="mt-2 text-title-lg font-semibold text-text-primary">{card.title}</h3>
              <p className="mt-2 text-body-md text-text-secondary">{card.body}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
