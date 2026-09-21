"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/primitives/Button";
import { duration } from "@/lib/motion";

const OWNER_PLANS = [
  { name: "Free", price: "₹0", body: "List free, forever", features: ["Unlimited listings", "Verified badge if in an HTC community", "Filtered enquiries", "Visit scheduling"] },
  { name: "Assisted", price: "₹2,500/tenant found", body: "For owners who want the tenant found for them", features: ["Everything in Free", "Listing built for you", "Enquiries screened", "Visits conducted", "Agreement drafted and registered"], recommended: true },
  { name: "Managed", price: "₹4,000/month", body: "For owners who live elsewhere", features: ["Everything in Assisted", "Rent collection", "Maintenance coordination", "Inspections", "Quarterly condition report"] },
];

const COMMUNITY_PLANS = [
  { name: "Starter", price: "₹150/home/month", body: "Visitor entry and communication", features: ["Visitor and gate entry", "Notices and polls", "Resident directory", "Complaints desk"] },
  { name: "Complete", price: "₹250/home/month", body: "The whole operation", features: ["Everything in Starter", "Maintenance billing", "Dues and collections", "Accounting", "Facility booking"], recommended: true },
  { name: "Enterprise", price: "Talk to us", body: "Multiple properties, custom needs", features: ["Everything in Complete", "Dedicated support", "Custom reporting", "Multi-property rollup"] },
];

function PlanCard({ plan }: { plan: (typeof OWNER_PLANS)[number] }) {
  return (
    <div
      className={`flex min-w-[260px] shrink-0 flex-col rounded-xl border bg-surface-raised p-6 snap-start sm:min-w-0 sm:shrink shadow-sm ${
        plan.recommended ? "border-t-4 border-t-red-600 border-x-border-subtle border-b-border-subtle -mt-2" : "border-border-subtle"
      }`}
    >
      <h2 className="text-title-lg font-semibold text-text-primary">{plan.name}</h2>
      <p className="mt-1 text-body-sm text-text-tertiary">{plan.body}</p>
      <p className="mt-4 font-sans text-price font-bold tabular-nums text-text-primary">{plan.price}</p>
      <ul className="mt-5 flex flex-col gap-2">
        {plan.features.map((f) => (
          <li key={f} className="text-body-sm text-text-secondary">
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <Button href="/contact" variant={plan.recommended ? "primary" : "ghost"} size="md" className="w-full">
          {plan.name === "Free" ? "List your property free" : "Talk to us"}
        </Button>
      </div>
    </div>
  );
}

export function PricingTables() {
  const [audience, setAudience] = useState("owners");
  const plans = audience === "owners" ? OWNER_PLANS : COMMUNITY_PLANS;

  return (
    <Section>
      <Container>
        <div className="flex justify-center">
          <Tabs
            tabs={[
              { id: "owners", label: "For owners" },
              { id: "communities", label: "For communities" },
            ]}
            active={audience}
            onChange={setAudience}
            layoutId="pricing-audience"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={audience}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base }}
            tabIndex={0}
            role="region"
            aria-label="Pricing plans"
            className="mt-10 flex gap-6 overflow-x-auto pb-4 [scroll-snap-type:x_mandatory] sm:grid sm:grid-cols-3 sm:overflow-visible focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </motion.div>
        </AnimatePresence>

        <p className="mx-auto mt-10 max-w-[60ch] text-center text-body-sm text-text-tertiary">
          Everything is included at each tier. We do not price per module, per notice, per SMS or per transaction, and
          we do not charge a setup fee.
        </p>
      </Container>
    </Section>
  );
}
