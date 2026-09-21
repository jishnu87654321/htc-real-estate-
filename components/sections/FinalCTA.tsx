"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { Reveal } from "@/components/primitives/Reveal";
import { duration, ease } from "@/lib/motion";

const BUTTONS = [
  { label: "Find a home", href: "/properties" },
  { label: "List a property", href: "/list-your-property" },
  { label: "Bring HTC to your community", href: "/communities" },
];

function WipeButton({ label, href }: { label: string; href: string }) {
  return (
    <motion.div initial="rest" whileHover="hover" animate="rest" className="relative group">
      <Link
        href={href}
        className="relative block overflow-hidden rounded-full border border-paper-300 bg-white px-7 py-3.5 text-center text-body-lg font-semibold text-text-primary shadow-sm transition-colors duration-200 group-hover:border-red-600"
      >
        <motion.span
          className="absolute inset-0 origin-bottom bg-red-600"
          variants={{ rest: { scaleY: 0 }, hover: { scaleY: 1 } }}
          transition={{ duration: duration.base, ease: ease.out }}
        />
        <span className="relative z-10 transition-colors duration-200 group-hover:text-white">{label}</span>
      </Link>
    </motion.div>
  );
}

export function FinalCTA() {
  return (
    <section className="bg-paper-100 py-[clamp(5rem,10vw,10rem)] text-text-primary border-t border-paper-200">
      <Container>
        <Reveal>
          <h2 className="text-center font-serif text-display-md text-text-primary">Whichever side of the gate you are on</h2>
        </Reveal>
        <Reveal stagger className="mx-auto mt-12 flex max-w-2xl flex-col flex-wrap justify-center gap-4 sm:flex-row">
          {BUTTONS.map((b) => (
            <div key={b.href} className="flex-1">
              <WipeButton {...b} />
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
