import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { applications, listings, savedListings, ownerSubmissions, statusEvents } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { Container } from "@/components/primitives/Container";
import { UserAccountView } from "@/components/sections/account/UserAccountView";

export const metadata = {
  title: "My Account — HTC",
  description: "View and manage your rental applications, saved homes, and property submissions.",
};

export default async function AccountPage() {
  const session = await requireUser("/account");
  const userId = session.user.id;

  // 1. Fetch user's applications joined with listing info
  const userApplications = await db
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
      createdAt: applications.createdAt,
      listingId: listings.id,
      listingTitle: listings.title,
      listingSlug: listings.slug,
      listingPrice: listings.price,
      listingLocality: listings.locality,
      listingBhk: listings.bhk,
    })
    .from(applications)
    .innerJoin(listings, eq(applications.listingId, listings.id))
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.createdAt));

  // 2. Fetch status events for these applications
  const appIds = userApplications.map((a) => a.id);
  const events =
    appIds.length > 0
      ? await db
          .select()
          .from(statusEvents)
          .where(inArray(statusEvents.entityId, appIds))
          .orderBy(desc(statusEvents.createdAt))
      : [];

  // 3. Fetch user's saved listings
  const saved = await db
    .select({
      listingId: listings.id,
      title: listings.title,
      slug: listings.slug,
      price: listings.price,
      locality: listings.locality,
      bhk: listings.bhk,
      areaSqft: listings.areaSqft,
      status: listings.status,
      intent: listings.intent,
      savedAt: savedListings.createdAt,
    })
    .from(savedListings)
    .innerJoin(listings, eq(savedListings.listingId, listings.id))
    .where(eq(savedListings.userId, userId))
    .orderBy(desc(savedListings.createdAt));

  // 4. Fetch user's property submissions
  const submissions = await db
    .select()
    .from(ownerSubmissions)
    .where(eq(ownerSubmissions.userId, userId))
    .orderBy(desc(ownerSubmissions.createdAt));

  return (
    <div className="py-12 md:py-16 bg-surface-sunken min-h-[calc(100vh-80px)]">
      <Container>
        <UserAccountView
          user={session.user}
          applications={userApplications}
          statusEvents={events}
          savedListings={saved}
          submissions={submissions}
        />
      </Container>
    </div>
  );
}
