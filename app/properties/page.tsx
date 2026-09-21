import { Suspense } from "react";
import type { Metadata } from "next";
import { PropertiesResults } from "@/components/sections/properties/PropertiesResults";

export const metadata: Metadata = {
  title: "Flats for rent in Hyderabad — HTC",
  description: "Search verified flats for rent and sale. No brokerage, ever. Homes in communities HTC manages are confirmed by the team on site.",
};

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-serif text-display-lg text-text-primary">Flats for rent in Hyderabad</h1>
          </div>
        </section>
      }
    >
      <PropertiesResults />
    </Suspense>
  );
}
