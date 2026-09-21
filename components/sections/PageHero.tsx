import type { ReactNode } from "react";
import { Container } from "@/components/primitives/Container";
import { Badge } from "@/components/primitives/Badge";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subhead?: ReactNode;
  children?: ReactNode;
  inverse?: boolean;
}

export function PageHero({ eyebrow, title, subhead, children }: PageHeroProps) {
  return (
    <section className="pt-16 pb-20 md:pt-24 md:pb-28">
      <Container>
        {eyebrow && (
          <Badge variant="red">
            {eyebrow}
          </Badge>
        )}
        <h1 className="mt-6 max-w-3xl font-serif text-display-lg text-text-primary">
          {title}
        </h1>
        {subhead && (
          <p className="mt-6 max-w-[52ch] text-body-lg text-text-secondary">
            {subhead}
          </p>
        )}
        {children}
      </Container>
    </section>
  );
}
