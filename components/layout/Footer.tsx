import Link from "next/link";
import { Container } from "@/components/primitives/Container";

const COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "Find",
    links: ["Flats for rent", "Flats for sale", "PG and co-living", "Commercial", "New projects", "Plots"],
  },
  {
    title: "Owners",
    links: ["List free", "Owner plans", "Rent agreement", "Tenant screening", "Property management"],
  },
  {
    title: "Communities",
    links: ["For RWAs", "For residents", "Operations console", "Community pricing", "Book a walkthrough"],
  },
  {
    title: "Services",
    links: ["Packers and movers", "Painting", "Deep cleaning", "Plumbing and electrical", "Home loans"],
  },
  {
    title: "Company",
    links: ["About", "How we make money", "Careers", "Press", "Blog", "Contact"],
  },
  {
    title: "Legal",
    links: ["Terms", "Privacy", "Refund policy", "Grievance officer", "Report a listing"],
  },
];

const CITIES = ["Hyderabad", "Bengaluru", "Chennai (coming soon)"];

const SEO_LINKS = [
  "Flats for rent in Gachibowli",
  "2 BHK flats in Kondapur",
  "3 BHK flats in HITEC City",
  "Flats for rent in Madhapur",
  "PG in Gachibowli",
  "Flats for sale in Kondapur",
  "Commercial space in HITEC City",
  "1 BHK flats in Madhapur",
];

export function Footer() {
  return (
    <footer className="bg-paper-100 text-text-primary border-t border-paper-200">
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-7">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <span className="font-serif text-3xl font-bold tracking-wider text-ink-900">HTC</span>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-label uppercase tracking-[0.08em] font-semibold text-ink-400">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-body-sm text-ink-600 transition-colors duration-150 hover:text-red-600">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-label uppercase tracking-[0.08em] font-semibold text-ink-400">Cities</p>
            <ul className="mt-4 flex flex-col gap-3">
              {CITIES.map((city) => (
                <li key={city}>
                  <Link href="#" className="text-body-sm text-ink-600 transition-colors duration-150 hover:text-red-600">
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-paper-300 pt-8">
          <p className="text-title-md font-semibold text-ink-900">No brokerage on any transaction, on any side, ever.</p>
          <p className="mt-2 text-body-sm text-ink-400">
            © 2026 HTC. All rights reserved.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-t border-paper-200 pt-8">
          {SEO_LINKS.map((link) => (
            <Link
              key={link}
              href="#"
              className="text-body-sm text-ink-400 transition-colors duration-150 hover:text-red-600"
            >
              {link}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}
