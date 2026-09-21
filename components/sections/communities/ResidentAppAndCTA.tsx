"use client";

import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/primitives/Button";

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

export function ResidentAppAndCTA() {
  return (
    <>
      <Section id="residents" className="bg-surface-page">
        <Container>
          <Reveal>
            <h2 className="font-serif text-display-md text-text-primary">What residents get</h2>
          </Reveal>
          <Reveal stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <Reveal className="mt-14 rounded-lg border border-border-subtle bg-surface-sunken p-8 text-center">
            <p className="text-title-lg font-semibold text-text-primary">Priced per home, per month</p>
            <p className="mt-2 text-body-md text-text-secondary">
              From ₹150 per home per month, everything included. Communities under 50 homes get a reduced rate.
            </p>
            <div className="mt-5">
              <Button href="/pricing" variant="ghost" size="md">
                See community pricing
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      <section className="bg-ink-900 py-[clamp(5rem,10vw,10rem)] text-bone-50">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="font-serif text-display-md">Book a walkthrough</h2>
            <p className="mt-4 max-w-[46ch] text-body-lg text-sage-200">
              A 30-minute walkthrough with someone who has set up 120 communities. We will look at your actual
              billing cycle and tell you what switching would involve.
            </p>
          </div>
          <form className="flex flex-col gap-4 lg:col-span-6" onSubmit={(e) => e.preventDefault()}>
            <Field id="wt-name" label="Your name" />
            <Field id="wt-community" label="Community name" />
            <Field id="wt-homes" label="Number of homes" />
            <Field id="wt-role" label="Your role" />
            <Field id="wt-phone" label="Phone" type="tel" />
            <Field id="wt-city" label="City" />
            <Button type="submit" variant="primary" size="lg">
              Book a walkthrough
            </Button>
          </form>
        </Container>
      </section>
    </>
  );
}

function Field({ id, label, type = "text" }: { id: string; label: string; type?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-body-sm font-medium text-sage-200">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        className="mt-1 w-full rounded-md border border-sage-700 bg-ink-800 px-3 py-2.5 text-body-md text-bone-50 focus:outline-none"
      />
    </div>
  );
}
