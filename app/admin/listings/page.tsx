import { db } from "@/lib/db/client";
import { listings, communities } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ExternalLink, Home } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const allListings = await db
    .select({
      id: listings.id,
      slug: listings.slug,
      title: listings.title,
      intent: listings.intent,
      status: listings.status,
      bhk: listings.bhk,
      price: listings.price,
      locality: listings.locality,
      city: listings.city,
      communityName: communities.name,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .leftJoin(communities, eq(listings.communityId, communities.id))
    .orderBy(desc(listings.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-display-sm text-text-primary">Property Listings Management</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          View all properties across Hyderabad with current availability status.
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-raised shadow-sm overflow-hidden">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-sunken border-b border-border-subtle text-body-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Property Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Locality</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Live URL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {allListings.map((l) => (
              <tr key={l.id} className="hover:bg-surface-sunken">
                <td className="px-4 py-3 font-semibold text-text-primary">
                  {l.title}
                </td>
                <td className="px-4 py-3 capitalize">{l.bhk} BHK · {l.intent}</td>
                <td className="px-4 py-3">{l.communityName || l.locality}</td>
                <td className="px-4 py-3 font-bold">₹{l.price.toLocaleString("en-IN")}/mo</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-label uppercase font-semibold ${
                      l.status === "active"
                        ? "bg-green-100 text-green-800"
                        : l.status === "rented" || l.status === "sold"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-stone-100 text-stone-800"
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/properties/${l.slug}`}
                    target="_blank"
                    className="text-red-600 hover:underline inline-flex items-center gap-1 text-body-xs font-medium"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
