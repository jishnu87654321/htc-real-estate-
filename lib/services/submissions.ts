import { db } from "@/lib/db/client";
import {
  ownerSubmissions,
  walkthroughRequests,
  enquiries,
  listings,
  statusEvents,
  auditLog,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateReference } from "@/lib/utils/reference";

export async function createOwnerSubmission(data: {
  userId?: string | null;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  locality: string;
  city?: string;
  communityName?: string;
  bhk?: number;
  propertyType?: string;
  areaSqft?: number;
  floor?: number;
  totalFloors?: number;
  furnishing?: string;
  price: number;
  deposit?: number;
  maintenance?: number;
  availableFrom?: string;
  tenantPreference?: string[];
  photosRequested?: boolean;
}) {
  const reference = await generateReference("L");

  const [inserted] = await db
    .insert(ownerSubmissions)
    .values({
      reference,
      userId: data.userId || null,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      ownerPhone: data.ownerPhone,
      locality: data.locality,
      city: data.city || "Hyderabad",
      communityName: data.communityName || null,
      bhk: data.bhk || null,
      propertyType: data.propertyType || "Apartment",
      areaSqft: data.areaSqft || null,
      floor: data.floor || null,
      totalFloors: data.totalFloors || null,
      furnishing: data.furnishing || "Semi-Furnished",
      price: data.price,
      deposit: data.deposit || null,
      maintenance: data.maintenance || null,
      availableFrom: data.availableFrom || null,
      tenantPreference: data.tenantPreference || null,
      photosRequested: data.photosRequested ?? false,
      status: "submitted",
    })
    .returning();

  await db.insert(statusEvents).values({
    entityType: "owner_submission",
    entityId: inserted.id,
    fromStatus: null,
    toStatus: "submitted",
    actorId: data.userId || null,
    actorName: data.ownerName,
    reason: "Submitted via List Your Property page",
  });

  return inserted;
}

export async function createWalkthroughRequest(data: {
  name: string;
  phone: string;
  email?: string;
  communityName: string;
  numberOfHomes?: number;
  role?: string;
  city?: string;
}) {
  const reference = await generateReference("W");

  const [inserted] = await db
    .insert(walkthroughRequests)
    .values({
      reference,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      communityName: data.communityName,
      numberOfHomes: data.numberOfHomes || null,
      role: data.role || null,
      city: data.city || "Hyderabad",
      status: "new",
    })
    .returning();

  await db.insert(statusEvents).values({
    entityType: "walkthrough_request",
    entityId: inserted.id,
    fromStatus: null,
    toStatus: "new",
    actorName: data.name,
    reason: "Submitted via Communities walkthrough modal",
  });

  return inserted;
}

export async function createEnquiry(data: {
  name: string;
  email: string;
  phone: string;
  category: "find_home" | "list_property" | "community" | "support" | "billing" | "partnership" | "other";
  message: string;
  source: string;
  listingId?: string | null;
  userId?: string | null;
  ipHash?: string;
}) {
  const reference = await generateReference("Q");

  const [inserted] = await db
    .insert(enquiries)
    .values({
      reference,
      name: data.name,
      email: data.email,
      phone: data.phone,
      category: data.category,
      message: data.message,
      source: data.source,
      listingId: data.listingId || null,
      userId: data.userId || null,
      status: "new",
      consentAt: new Date(),
      ipHash: data.ipHash || null,
    })
    .returning();

  await db.insert(statusEvents).values({
    entityType: "enquiry",
    entityId: inserted.id,
    fromStatus: null,
    toStatus: "new",
    actorName: data.name,
    reason: `Enquiry submitted on ${data.source}`,
  });

  return inserted;
}

export async function transitionSubmissionStatus(params: {
  submissionId: string;
  toStatus: "submitted" | "under_review" | "verification_scheduled" | "approved" | "rejected";
  actorId?: string;
  actorName: string;
  reason?: string;
}) {
  return await db.transaction(async (tx) => {
    const [sub] = await tx
      .select()
      .from(ownerSubmissions)
      .where(eq(ownerSubmissions.id, params.submissionId))
      .limit(1);

    if (!sub) throw new Error("Submission not found");

    const fromStatus = sub.status;
    let createdListingId = sub.createdListingId;

    // If approved and no listing created yet, auto-create active listing
    if (params.toStatus === "approved" && !createdListingId) {
      const refSuffix = sub.reference.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const slug = `${sub.locality.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${sub.bhk || 2}bhk-${refSuffix}`;
      const title = `${sub.bhk ? `${sub.bhk} BHK` : "Apartment"} in ${sub.communityName || sub.locality}, ${sub.locality}`;

      const [newListing] = await tx
        .insert(listings)
        .values({
          slug,
          title,
          intent: "rent",
          status: "active",
          bhk: sub.bhk || 2,
          propertyType: sub.propertyType || "Apartment",
          areaSqft: sub.areaSqft || 1200,
          floor: sub.floor || 1,
          totalFloors: sub.totalFloors || 10,
          furnishing: sub.furnishing || "Semi-Furnished",
          price: sub.price,
          deposit: sub.deposit || sub.price * 2,
          maintenance: sub.maintenance || 2500,
          availableFrom: sub.availableFrom || null,
          tenantPreference: sub.tenantPreference || ["Family", "Professionals"],
          locality: sub.locality,
          city: sub.city,
          description: `Verified ${sub.bhk || 2} BHK property in ${sub.locality}. Submitted by owner and verified by HTC team.`,
          ownerUserId: sub.userId,
          submissionId: sub.id,
          verifiedByName: params.actorName,
          verifiedAt: new Date(),
          publishedAt: new Date(),
        })
        .returning({ id: listings.id });

      createdListingId = newListing.id;
    }

    const [updated] = await tx
      .update(ownerSubmissions)
      .set({
        status: params.toStatus,
        createdListingId,
        updatedAt: new Date(),
      })
      .where(eq(ownerSubmissions.id, params.submissionId))
      .returning();

    await tx.insert(statusEvents).values({
      entityType: "owner_submission",
      entityId: sub.id,
      fromStatus,
      toStatus: params.toStatus,
      actorId: params.actorId || null,
      actorName: params.actorName,
      reason: params.reason || null,
    });

    await tx.insert(auditLog).values({
      actorId: params.actorId || null,
      actorName: params.actorName,
      action: `submission_status_${params.toStatus}`,
      entityType: "owner_submission",
      entityId: sub.id,
      detailsJson: {
        fromStatus,
        toStatus: params.toStatus,
        createdListingId,
      },
    });

    return updated;
  });
}
