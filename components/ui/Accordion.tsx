import { ChevronDown } from "lucide-react";

export interface AccordionEntry {
  question: string;
  answer: string;
}

/**
 * Open/close is pure CSS (grid-template-rows on [open]) via native
 * <details name="..."> for exclusivity — works with zero JS, animates when
 * JS and CSS transitions are both available, and respects reduced motion
 * automatically through the stylesheet's media query.
 */
export function Accordion({ items, groupName }: { items: AccordionEntry[]; groupName: string }) {
  return (
    <div className="divide-y divide-border-subtle border-y border-border-subtle">
      {items.map((item, i) => (
        <details key={item.question} name={groupName} className="accordion-item group py-2" open={i === -1}>
          <summary className="flex cursor-pointer items-center justify-between gap-4 py-4">
            <span className="text-title-lg font-semibold text-text-primary">{item.question}</span>
            <ChevronDown className="accordion-chevron h-5 w-5 shrink-0 text-text-tertiary" />
          </summary>
          <div className="accordion-body">
            <div className="accordion-body-inner">
              <p className="max-w-[68ch] pb-5 text-body-md text-text-secondary">{item.answer}</p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
