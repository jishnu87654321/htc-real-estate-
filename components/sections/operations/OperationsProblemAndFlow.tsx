import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { OperationsFlow } from "@/components/sections/operations/OperationsFlow";

export function OperationsProblemAndFlow() {
  return (
    <>
      <Section className="bg-surface-sunken">
        <Container className="max-w-3xl">
          <Reveal>
            <h2 className="font-serif text-display-md text-text-primary">Resident apps stop at the gate</h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 text-body-lg text-text-secondary">
              A complaint gets raised in the app and then lands in a WhatsApp group where a supervisor may or may not
              see it. The guard changing shift at 8pm tells the next guard what he remembers. The plumber says he
              came; nobody can prove it. Three months later the committee changes and none of it is written down
              anywhere.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 font-serif text-display-sm italic text-text-primary">
              Every one of those is a communication failure, not a software feature gap.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <h2 className="text-center font-serif text-display-md text-text-primary">Who talks to whom, and what gets recorded</h2>
          </Reveal>
          <div className="mx-auto mt-10 max-w-3xl">
            <OperationsFlow />
          </div>
          <p className="mx-auto mt-6 max-w-[46ch] text-center text-body-md text-text-secondary">
            Every arrow is timestamped, has an owner, and survives the next committee handover.
          </p>
        </Container>
      </Section>
    </>
  );
}
