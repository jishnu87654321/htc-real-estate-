import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/primitives/Button";

const FREE_ITEMS = [
  "Unlimited listings, with photos and video",
  "Verified badge if your home is in an HTC community",
  "Enquiries filtered, with the tenant's platform history attached",
  "Visit scheduling and reminders",
  "A rental agreement template that holds up",
  "Market rent guidance for your locality",
];

const PLANS = [
  {
    name: "Assisted",
    audience: "Owners who want the tenant found for them",
    body: "Photos and listing built for you, enquiries screened, visits conducted, agreement drafted and registered",
  },
  {
    name: "Managed",
    audience: "Owners who live elsewhere, or do not want to think about it",
    body: "Everything in Assisted, plus rent collection, maintenance coordination, inspections and a quarterly condition report",
  },
];

export function ListFreeAndPlans() {
  return (
    <>
      <Section className="bg-surface-page">
        <Container className="max-w-3xl">
          <Reveal>
            <h2 className="font-serif text-display-md text-text-primary">Free means free</h2>
          </Reveal>
          <Reveal stagger className="mt-8 flex flex-col gap-3">
            {FREE_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-600" />
                <span className="text-body-md text-text-secondary">{item}</span>
              </div>
            ))}
          </Reveal>
          <Reveal>
            <p className="mt-10 max-w-[52ch] font-serif text-display-sm italic text-text-primary">
              We do not charge you brokerage. We never will. Paid plans add work we do for you, not access we take
              away.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section className="bg-surface-sunken">
        <Container>
          <Reveal>
            <h2 className="font-serif text-display-md text-text-primary">Or hand the whole thing over</h2>
          </Reveal>
          <Reveal stagger className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {PLANS.map((plan) => (
              <div key={plan.name} className="rounded-lg border border-border-subtle bg-surface-raised p-8">
                <h3 className="font-serif text-display-sm text-text-primary">{plan.name}</h3>
                <p className="mt-2 text-body-sm font-medium uppercase tracking-[0.04em] text-clay-600">{plan.audience}</p>
                <p className="mt-4 text-body-md text-text-secondary">{plan.body}</p>
              </div>
            ))}
          </Reveal>
          <div className="mt-8">
            <Button href="/pricing" variant="ghost" size="md">
              Compare owner plans
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
