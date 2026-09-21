import { Container } from "@/components/primitives/Container";
import { Section } from "@/components/primitives/Section";

export function ContactInfo() {
  return (
    <Section className="bg-surface-sunken">
      <Container className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-title-md font-semibold text-text-primary">Phone</h2>
          <p className="mt-2 text-body-md text-text-secondary">+91 40 6900 0000</p>
          <p className="text-body-sm text-text-tertiary">9am–7pm, Monday–Saturday</p>
        </div>
        <div>
          <h2 className="text-title-md font-semibold text-text-primary">WhatsApp</h2>
          <p className="mt-2 text-body-md text-text-secondary">+91 90000 00000</p>
        </div>
        <div>
          <h2 className="text-title-md font-semibold text-text-primary">Email</h2>
          <p className="mt-2 text-body-sm text-text-secondary">support@htc.in — seekers</p>
          <p className="text-body-sm text-text-secondary">owners@htc.in — owners</p>
          <p className="text-body-sm text-text-secondary">communities@htc.in — committees</p>
        </div>
        <div>
          <h2 className="text-title-md font-semibold text-text-primary">Registered office</h2>
          <p className="mt-2 text-body-sm text-text-secondary">Plot 12, HITEC City, Hyderabad 500081</p>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <h2 className="text-title-md font-semibold text-text-primary">Grievance officer</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            Grievance Officer — grievance@htc.in, as required under the Information Technology Act, 2000 and
            associated rules.
          </p>
        </div>
      </Container>
    </Section>
  );
}
