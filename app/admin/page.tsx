import { db } from "@/lib/db/client";
import {
  applications,
  enquiries,
  ownerSubmissions,
  walkthroughRequests,
  listings,
} from "@/lib/db/schema";
import { count, eq, notInArray, desc } from "drizzle-orm";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Building2,
  Calendar,
  Home,
  ArrowUpRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Fetch counts
  const [openApps] = await db
    .select({ count: count() })
    .from(applications)
    .where(notInArray(applications.status, ["closed_won", "closed_lost", "withdrawn"]));

  const [newEnquiries] = await db
    .select({ count: count() })
    .from(enquiries)
    .where(eq(enquiries.status, "new"));

  const [pendingSubmissions] = await db
    .select({ count: count() })
    .from(ownerSubmissions)
    .where(eq(ownerSubmissions.status, "submitted"));

  const [walkthroughs] = await db
    .select({ count: count() })
    .from(walkthroughRequests)
    .where(eq(walkthroughRequests.status, "new"));

  const [activeListings] = await db
    .select({ count: count() })
    .from(listings)
    .where(eq(listings.status, "active"));

  // 2. Fetch recent applications
  const recentApps = await db
    .select({
      id: applications.id,
      reference: applications.reference,
      intent: applications.intent,
      status: applications.status,
      contactPhone: applications.contactPhone,
      createdAt: applications.createdAt,
      listingTitle: listings.title,
    })
    .from(applications)
    .innerJoin(listings, eq(applications.listingId, listings.id))
    .orderBy(desc(applications.createdAt))
    .limit(5);

  // 3. Fetch recent enquiries
  const recentEnquiries = await db
    .select()
    .from(enquiries)
    .orderBy(desc(enquiries.createdAt))
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-display-sm text-text-primary">Operations Dashboard</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Overview of active applications, leads, submissions, and listings.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          href="/admin/applications"
          className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm hover:border-red-300 transition-colors"
        >
          <div className="flex items-center justify-between text-text-tertiary">
            <FileText className="h-5 w-5 text-red-600" />
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <p className="mt-4 font-sans text-display-md font-bold text-text-primary">
            {openApps.count}
          </p>
          <p className="text-body-xs font-medium text-text-secondary">Open Applications</p>
        </Link>

        <Link
          href="/admin/enquiries"
          className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm hover:border-red-300 transition-colors"
        >
          <div className="flex items-center justify-between text-text-tertiary">
            <MessageSquare className="h-5 w-5 text-amber-600" />
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <p className="mt-4 font-sans text-display-md font-bold text-text-primary">
            {newEnquiries.count}
          </p>
          <p className="text-body-xs font-medium text-text-secondary">New Queries / Leads</p>
        </Link>

        <Link
          href="/admin/submissions"
          className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm hover:border-red-300 transition-colors"
        >
          <div className="flex items-center justify-between text-text-tertiary">
            <Building2 className="h-5 w-5 text-blue-600" />
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <p className="mt-4 font-sans text-display-md font-bold text-text-primary">
            {pendingSubmissions.count}
          </p>
          <p className="text-body-xs font-medium text-text-secondary">Pending Submissions</p>
        </Link>

        <Link
          href="/admin/walkthroughs"
          className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm hover:border-red-300 transition-colors"
        >
          <div className="flex items-center justify-between text-text-tertiary">
            <Calendar className="h-5 w-5 text-purple-600" />
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <p className="mt-4 font-sans text-display-md font-bold text-text-primary">
            {walkthroughs.count}
          </p>
          <p className="text-body-xs font-medium text-text-secondary">Walkthrough Requests</p>
        </Link>

        <Link
          href="/admin/listings"
          className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm hover:border-red-300 transition-colors"
        >
          <div className="flex items-center justify-between text-text-tertiary">
            <Home className="h-5 w-5 text-emerald-600" />
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <p className="mt-4 font-sans text-display-md font-bold text-text-primary">
            {activeListings.count}
          </p>
          <p className="text-body-xs font-medium text-text-secondary">Active Live Listings</p>
        </Link>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Applications */}
        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-title-md font-bold text-text-primary">Recent Applications</h2>
            <Link href="/admin/applications" className="text-body-xs font-medium text-red-600 hover:underline">
              View All →
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <p className="text-body-sm text-text-secondary py-4">No applications submitted yet.</p>
          ) : (
            <div className="divide-y divide-border-subtle">
              {recentApps.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-body-xs font-bold text-text-tertiary">
                        {app.reference}
                      </span>
                      <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-label font-medium uppercase">
                        {app.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-body-sm font-medium text-text-primary mt-0.5 truncate max-w-xs sm:max-w-sm">
                      {app.listingTitle}
                    </p>
                  </div>
                  <Link
                    href={`/admin/applications?ref=${app.reference}`}
                    className="text-body-xs font-medium text-red-600 hover:underline shrink-0"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Queries */}
        <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-title-md font-bold text-text-primary">Recent Inquiries & Leads</h2>
            <Link href="/admin/enquiries" className="text-body-xs font-medium text-red-600 hover:underline">
              View All →
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <p className="text-body-sm text-text-secondary py-4">No inquiries yet.</p>
          ) : (
            <div className="divide-y divide-border-subtle">
              {recentEnquiries.map((q) => (
                <div key={q.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-body-xs font-bold text-text-tertiary">
                        {q.reference}
                      </span>
                      <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-label font-medium uppercase">
                        {q.category}
                      </span>
                    </div>
                    <p className="text-body-sm font-medium text-text-primary mt-0.5">
                      {q.name} · {q.phone}
                    </p>
                  </div>
                  <Link
                    href={`/admin/enquiries?ref=${q.reference}`}
                    className="text-body-xs font-medium text-red-600 hover:underline shrink-0"
                  >
                    Respond
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
