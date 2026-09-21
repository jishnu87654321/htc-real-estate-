import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";

const OBJECTIONS = [
  { objection: "Our residents will not download another app", answer: "Residents without a smartphone are managed from the console by the committee. Nobody is locked out." },
  { objection: "We are mid-financial-year", answer: "Billing can begin at any cycle boundary. We carry arrears and opening balances across." },
  { objection: "What if we want to leave?", answer: "Export every ledger, resident record and document at any time, in a standard format, without asking us." },
  { objection: "Who owns the data?", answer: "The community does. Not HTC. That is in the agreement, not just on this page." },
  { objection: "We already use another platform", answer: "We will migrate from it. Tell us which one on the call and we will say honestly how clean the migration will be." },
];

export function Migration() {
  return (
    <Section className="bg-surface-sunken">
      <Container className="max-w-3xl">
        <Reveal>
          <h2 className="font-serif text-display-md text-text-primary">You do not have to move everything at once</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-6 text-body-lg text-text-secondary">
            Most communities start with visitor entry and notices, because those change resident behaviour in a week.
            Billing comes across at the start of the next cycle, once the committee is comfortable. We do the data
            migration, and the previous system&apos;s records come with you.
          </p>
        </Reveal>

        <Reveal className="mt-10 divide-y divide-border-subtle">
          {OBJECTIONS.map((o) => (
            <div key={o.objection} className="py-5">
              <p className="text-title-md font-semibold text-text-primary">{o.objection}</p>
              <p className="mt-2 text-body-md text-text-secondary">{o.answer}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
