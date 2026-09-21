"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import { Container } from "@/components/primitives/Container";
import { duration, ease } from "@/lib/motion";
import { MobileNav } from "@/components/layout/MobileNav";

const NAV_LINKS = [
  { label: "Buy", href: "/properties?tab=buy" },
  { label: "Rent", href: "/properties" },
  { label: "Communities", href: "/communities" },
  { label: "For Owners", href: "/list-your-property" },
  { label: "Pricing", href: "/pricing" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setCompressed(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHeroTransparent = pathname === "/" && !scrolled;

  return (
    <>
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isHeroTransparent
            ? "bg-transparent border-b border-transparent text-white"
            : "bg-paper-50/95 backdrop-blur-md border-b border-border-subtle"
        } ${scrolled ? "shadow-sm" : ""}`}
        initial={false}
        animate={{
          height: compressed ? 64 : 76,
        }}
        transition={{ duration: duration.base, ease: ease.inOut }}
      >
        <Container className="flex h-full items-center justify-between">
          {/* HTC Wordmark in Instrument Serif */}
          <Link href="/" className={`shrink-0 flex items-center group py-1 ${isHeroTransparent ? "text-white" : ""}`} aria-label="HTC Home">
            <motion.span
              className={`font-serif font-bold tracking-wider transition-colors ${
                isHeroTransparent
                  ? "text-white group-hover:text-paper-200"
                  : "text-ink-900 group-hover:text-red-700"
              }`}
              initial={false}
              animate={{ fontSize: compressed ? "1.4rem" : "1.75rem" }}
              transition={{ duration: duration.base, ease: ease.inOut }}
            >
              HTC
            </motion.span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 min-w-0 shrink">
            {NAV_LINKS.map((link) => {
              const baseHref = link.href.split("?")[0];
              const isActive = pathname === link.href || (baseHref !== "/" && pathname === baseHref);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative py-1 text-body-sm font-medium transition-colors shrink-0 ${
                    isActive
                      ? isHeroTransparent
                        ? "text-white font-semibold"
                        : "text-red-700 font-semibold"
                      : isHeroTransparent
                      ? "text-white/90 hover:text-white"
                      : "text-text-primary hover:text-red-700"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 w-full ${
                      isHeroTransparent ? "bg-white" : "bg-red-600"
                    } transition-transform duration-200 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/list-your-property"
              className="inline-flex items-center justify-center rounded-full border border-border-strong bg-surface-raised px-4 py-2 font-sans text-body-sm font-medium text-text-primary shadow-xs transition-all hover:bg-surface-sunken hover:border-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              List Property
            </Link>

            <div className="hidden sm:block">
              <Link href="/login">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-ink-900 px-5 py-2 font-sans text-body-sm font-medium text-white shadow-sm transition-all hover:bg-ink-800 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 cursor-pointer"
                >
                  Sign In
                </button>
              </Link>
            </div>

            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 items-center justify-center lg:hidden rounded-lg text-ink-900 hover:bg-paper-200 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </Container>
      </motion.header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} />
    </>
  );
}

