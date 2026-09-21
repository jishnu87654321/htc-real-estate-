"use server";

import { applicationSchema, normalizePhone } from "@/lib/validation/forms";
import { createApplication, transitionApplicationStatus } from "@/lib/services/applications";
import { getServerSession, requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { savedListings, applications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitApplicationAction(formData: unknown) {
  const session = await getServerSession();
  if (!session?.user) {
    return {
      success: false,
      error: "Authentication required. Please sign in or create an account to apply.",
      requiresAuth: true,
    };
  }

  const parsed = applicationSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid application data" };
  }

  try {
    const record = await createApplication({
      listingId: parsed.data.listingId,
      userId: session.user.id,
      intent: parsed.data.intent,
      moveInDate: parsed.data.moveInDate,
      budget: parsed.data.budget,
      occupants: parsed.data.occupants,
      contactPhone: normalizePhone(parsed.data.contactPhone),
      message: parsed.data.message,
    });

    revalidatePath("/account");
    revalidatePath(`/properties`);

    return {
      success: true,
      reference: record.reference,
      message: `Your application (${record.reference}) has been submitted! You can track its progress in your Account dashboard.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit application.";
    return { success: false, error: msg };
  }
}

export async function withdrawApplicationAction(applicationId: string, reason?: string) {
  const session = await requireUser();

  const [app] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.userId, session.user.id)))
    .limit(1);

  if (!app) {
    return { success: false, error: "Application not found." };
  }

  if (["closed_won", "closed_lost", "withdrawn"].includes(app.status)) {
    return { success: false, error: "This application is already closed." };
  }

  try {
    await transitionApplicationStatus({
      applicationId,
      toStatus: "withdrawn",
      actorId: session.user.id,
      actorName: session.user.name || "Applicant",
      reason: reason || "Withdrawn by applicant",
    });

    revalidatePath("/account");
    return { success: true, message: "Application withdrawn successfully." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to withdraw application.";
    return { success: false, error: msg };
  }
}

export async function toggleSaveListingAction(listingId: string) {
  const session = await getServerSession();
  if (!session?.user) {
    return { success: false, error: "Please sign in to save properties.", requiresAuth: true };
  }

  const existing = await db
    .select()
    .from(savedListings)
    .where(and(eq(savedListings.userId, session.user.id), eq(savedListings.listingId, listingId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(savedListings)
      .where(and(eq(savedListings.userId, session.user.id), eq(savedListings.listingId, listingId)));

    revalidatePath("/account");
    return { success: true, saved: false, message: "Removed from saved homes." };
  } else {
    await db.insert(savedListings).values({
      userId: session.user.id,
      listingId,
    });

    revalidatePath("/account");
    return { success: true, saved: true, message: "Saved to your account." };
  }
}
