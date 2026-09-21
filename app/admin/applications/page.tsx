import { Suspense } from "react";
import { db } from "@/lib/db/client";
import { applications, listings, user, notes, statusEvents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminApplicationsView } from "@/components/sections/admin/AdminApplicationsView";

export const dynamic = "force-dynamic";

async function ApplicationsContent() {
  const allApps = await db
    .select({
      id: applications.id,
      reference: applications.reference,
      intent: applications.intent,
      status: applications.status,
      moveInDate: applications.moveInDate,
      budget: applications.budget,
      occupants: applications.occupants,
      contactPhone: applications.contactPhone,
      message: applications.message,
      closeReason: applications.closeReason,
      nextFollowUpAt: applications.nextFollowUpAt,
      visitAt: applications.visitAt,
      assignedTo: applications.assignedTo,
      createdAt: applications.createdAt,
      listingId: listings.id,
      listingTitle: listings.title,
      listingSlug: listings.slug,
      listingPrice: listings.price,
      listingLocality: listings.locality,
      userName: user.name,
      userEmail: user.email,
    })
    .from(applications)
    .innerJoin(listings, eq(applications.listingId, listings.id))
    .innerJoin(user, eq(applications.userId, user.id))
    .orderBy(desc(applications.createdAt));

  const staffUsers = await db
    .select({ id: user.id, name: user.name, role: user.role })
    .from(user)
    .where(eq(user.role, "staff"));

  const adminUsers = await db
    .select({ id: user.id, name: user.name, role: user.role })
    .from(user)
    .where(eq(user.role, "admin"));

  const assignees = [...staffUsers, ...adminUsers];

  const allNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.entityType, "application"))
    .orderBy(desc(notes.createdAt));

  const allEvents = await db
    .select()
    .from(statusEvents)
    .where(eq(statusEvents.entityType, "application"))
    .orderBy(desc(statusEvents.createdAt));

  return (
    <AdminApplicationsView
      applications={allApps}
      staffUsers={assignees}
      notes={allNotes}
      statusEvents={allEvents}
    />
  );
}

export default function AdminApplicationsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="p-8 text-center text-text-tertiary">Loading applications...</div>}>
        <ApplicationsContent />
      </Suspense>
    </div>
  );
}
