import { db } from "@/lib/db/client";
import {
  applications,
  listings,
  statusEvents,
  auditLog,
} from "@/lib/db/schema";
import { eq, and, sql, notInArray } from "drizzle-orm";
import { generateReference } from "@/lib/utils/reference";

export interface CreateApplicationParams {
  listingId: string;
  userId: string;
  intent: "rent" | "buy";
  moveInDate?: string;
  budget?: number;
  occupants?: number;
  contactPhone: string;
  message?: string;
}

export async function createApplication(params: CreateApplicationParams) {
  return await db.transaction(async (tx) => {
    // 1. Check if listing is active
    const [listing] = await tx
      .select()
      .from(listings)
      .where(eq(listings.id, params.listingId))
      .limit(1);

    if (!listing) {
      throw new Error("Listing not found.");
    }
    if (listing.status !== "active") {
      throw new Error(`This listing is currently ${listing.status} and not accepting new applications.`);
    }

    // 2. Check if user already has an active/open application on this listing
    const existingOpen = await tx
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.listingId, params.listingId),
          eq(applications.userId, params.userId),
          notInArray(applications.status, ["closed_won", "closed_lost", "withdrawn"])
        )
      )
      .limit(1);

    if (existingOpen.length > 0) {
      throw new Error(
        `You already have an active application (${existingOpen[0].reference}) for this property.`
      );
    }

    // 3. Generate sequential reference
    const reference = await generateReference("APP");

    // 4. Insert application record
    const [inserted] = await tx
      .insert(applications)
      .values({
        reference,
        listingId: params.listingId,
        userId: params.userId,
        intent: params.intent,
        status: "submitted",
        moveInDate: params.moveInDate ? params.moveInDate : null,
        budget: params.budget || null,
        occupants: params.occupants || 1,
        contactPhone: params.contactPhone,
        message: params.message || null,
      })
      .returning();

    // 5. Record status event
    await tx.insert(statusEvents).values({
      entityType: "application",
      entityId: inserted.id,
      fromStatus: null,
      toStatus: "submitted",
      actorId: params.userId,
      actorName: "Applicant",
      reason: "Application submitted online",
    });

    return inserted;
  });
}

export interface TransitionApplicationParams {
  applicationId: string;
  toStatus:
    | "submitted"
    | "contacted"
    | "visit_scheduled"
    | "visit_done"
    | "negotiating"
    | "approved"
    | "closed_won"
    | "closed_lost"
    | "withdrawn";
  actorId?: string;
  actorName: string;
  reason?: string;
  nextFollowUpAt?: Date | null;
  visitAt?: Date | null;
}

export async function transitionApplicationStatus(params: TransitionApplicationParams) {
  return await db.transaction(async (tx) => {
    // 1. Fetch current application
    const [app] = await tx
      .select()
      .from(applications)
      .where(eq(applications.id, params.applicationId))
      .limit(1);

    if (!app) {
      throw new Error("Application not found.");
    }

    const fromStatus = app.status;
    const now = new Date();

    // 2. Update target application
    const [updatedApp] = await tx
      .update(applications)
      .set({
        status: params.toStatus,
        closeReason:
          params.toStatus === "closed_lost" || params.toStatus === "withdrawn"
            ? params.reason || app.closeReason
            : null,
        nextFollowUpAt: params.nextFollowUpAt !== undefined ? params.nextFollowUpAt : app.nextFollowUpAt,
        visitAt: params.visitAt !== undefined ? params.visitAt : app.visitAt,
        updatedAt: now,
      })
      .where(eq(applications.id, params.applicationId))
      .returning();

    // 3. Record status event
    await tx.insert(statusEvents).values({
      entityType: "application",
      entityId: app.id,
      fromStatus,
      toStatus: params.toStatus,
      actorId: params.actorId || null,
      actorName: params.actorName,
      reason: params.reason || null,
    });

    // 4. Handle approved: Flip listing to reserved
    if (params.toStatus === "approved") {
      await tx
        .update(listings)
        .set({
          status: "reserved",
          updatedAt: now,
        })
        .where(and(eq(listings.id, app.listingId), eq(listings.status, "active")));

      await tx.insert(auditLog).values({
        actorId: params.actorId || null,
        actorName: params.actorName,
        action: "listing_status_change",
        entityType: "listing",
        entityId: app.listingId,
        detailsJson: {
          reason: `Application ${app.reference} approved`,
          toStatus: "reserved",
        },
      });
    }

    // 5. Handle revert: If previously approved and now closed_lost / withdrawn, revert listing to active if no other approved app exists
    if (fromStatus === "approved" && (params.toStatus === "closed_lost" || params.toStatus === "withdrawn")) {
      const otherApproved = await tx
        .select()
        .from(applications)
        .where(
          and(
            eq(applications.listingId, app.listingId),
            sql`${applications.id} != ${app.id}`,
            eq(applications.status, "approved")
          )
        )
        .limit(1);

      if (otherApproved.length === 0) {
        await tx
          .update(listings)
          .set({
            status: "active",
            updatedAt: now,
          })
          .where(and(eq(listings.id, app.listingId), eq(listings.status, "reserved")));

        await tx.insert(auditLog).values({
          actorId: params.actorId || null,
          actorName: params.actorName,
          action: "listing_status_change",
          entityType: "listing",
          entityId: app.listingId,
          detailsJson: {
            reason: `Approved application ${app.reference} was marked ${params.toStatus}; listing reverted to active`,
            toStatus: "active",
          },
        });
      }
    }

    // 6. Handle closed_won: Auto-transition listing and competing applications
    if (params.toStatus === "closed_won") {
      const listingNewStatus = app.intent === "buy" ? "sold" : "rented";

      // A. Update listing status
      await tx
        .update(listings)
        .set({
          status: listingNewStatus,
          closedAt: now,
          updatedAt: now,
        })
        .where(eq(listings.id, app.listingId));

      // B. Find all other open applications for this listing
      const competingApps = await tx
        .select()
        .from(applications)
        .where(
          and(
            eq(applications.listingId, app.listingId),
            sql`${applications.id} != ${app.id}`,
            notInArray(applications.status, ["closed_won", "closed_lost", "withdrawn"])
          )
        );

      // C. Close competing applications
      for (const compApp of competingApps) {
        await tx
          .update(applications)
          .set({
            status: "closed_lost",
            closeReason: "Listing no longer available",
            updatedAt: now,
          })
          .where(eq(applications.id, compApp.id));

        await tx.insert(statusEvents).values({
          entityType: "application",
          entityId: compApp.id,
          fromStatus: compApp.status,
          toStatus: "closed_lost",
          actorId: params.actorId || null,
          actorName: "System Automation",
          reason: `Listing marked as ${listingNewStatus} (Closed Won on ${app.reference})`,
        });
      }

      // D. Audit log entry
      await tx.insert(auditLog).values({
        actorId: params.actorId || null,
        actorName: params.actorName,
        action: "application_closed_won",
        entityType: "application",
        entityId: app.id,
        detailsJson: {
          listingId: app.listingId,
          reference: app.reference,
          listingStatusSetTo: listingNewStatus,
          competingClosedCount: competingApps.length,
        },
      });
    }

    return updatedApp;
  });
}
