import type { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Consistent section vertical rhythm site-wide. Do not vary per section —
 * if a section feels cramped or loose, fix its content, not this padding.
 */
export function Section({ children, className = "", id }: SectionProps) {
  return (
    <section id={id} className={`py-[clamp(5rem,10vw,10rem)] ${className}`}>
      {children}
    </section>
  );
}
