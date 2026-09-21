import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { CommsGraph } from "@/components/sections/CommsGraph";

const CARDS = [
  {
    title: "From complaint to closed",
    body: "A resident complaint becomes an assigned job with an owner, a due time and a photo on completion.",
  },
  {
    title: "Nothing lost at gate change",
    body: "Guards log the shift, the incidents and the open items. The next shift starts informed.",
  },
  {
    title: "Escalations that have an owner",
    body: "Every vendor thread has a deadline and a named person. No thread dies in someone's inbox.",
  },
  {
    title: "An audit trail that survives the AGM",
    body: "Decisions, spends and approvals, kept in a form the next committee can actually read.",
  },
];

export function InternalComms() {
  return (
    <Section className="bg-surface-sunken">
      <Container>
        {/* Copy Section (Top, max-w-[58ch]) */}
        <div className="max-w-[58ch]">
          <Badge variant="sage">Behind the gate</Badge>
          <Reveal>
            <h2 className="mt-6 font-serif text-display-md text-text-primary">
              The committee, the manager, the guards and the vendors, on one line.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 text-body-lg text-text-secondary leading-relaxed">
              Most community software gives residents an app and leaves the staff on WhatsApp. HTC gives the
              operating team its own console: work orders to the right technician, guard shift handovers on
              record, vendor escalations with an owner and a deadline, and an audit trail the next committee can
              read.
            </p>
          </Reveal>
        </div>

        {/* Full-width CommsGraph Feature Panel (§B2) */}
        <div className="mt-12 w-full">
          <CommsGraph />
        </div>

        <Reveal stagger className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div key={card.title} className="rounded-lg border border-border-subtle bg-surface-raised p-6">
              <h3 className="text-title-lg font-semibold text-text-primary">{card.title}</h3>
              <p className="mt-2 text-body-md text-text-secondary">{card.body}</p>
            </div>
          ))}
        </Reveal>

        <div className="mt-12">
          <Button href="/operations" variant="primary" size="lg">
            See the operations console
          </Button>
        </div>
      </Container>
    </Section>
  );
}
