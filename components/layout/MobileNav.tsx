"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/primitives/Button";
import { duration, ease, stagger } from "@/lib/motion";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: { label: string; href: string }[];
}

export function MobileNav({ open, onClose, links }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 top-0 z-40 flex flex-col bg-ink-900 pt-24 lg:hidden"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: duration.slow, ease: ease.inOut }}
          role="dialog"
          aria-modal="true"
        >
          <motion.nav
            className="flex flex-col gap-1 px-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: stagger.base, delayChildren: 0.1 } } }}
          >
            {links.map((link) => (
              <motion.div
                key={link.href}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: duration.base, ease: ease.out }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block border-b border-sage-700 py-4 text-display-sm font-serif text-bone-50"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              className="mt-6 flex flex-col gap-3"
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: duration.base, ease: ease.out }}
            >
              <Button href="/list-your-property" variant="inverse-ghost" size="lg" onClick={onClose}>
                List Property
              </Button>
              <Button href="/login" variant="primary" size="lg" onClick={onClose}>
                Sign In
              </Button>
            </motion.div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
