"use server";

import { requireRole } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import {
  applications,
  enquiries,
  ownerSubmissions,
  walkthroughRequests,
  listings,
  user,
  notes,
  statusEvents,
  auditLog,
} from "@/lib/db/schema";
import {
  updateApplicationStatusSchema,
  updateEnquiryStatusSchema,
  updateSubmissionStatusSchema,
  updateWalkthroughStatusSchema,
  addNoteSchema,
  assignEntitySchema,
} from "@/lib/validation/forms";
import { transitionApplicationStatus } from "@/lib/services/applications";
import { transitionSubmissionStatus } from "@/lib/services/submissions";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function adminUpdateApplicationStatusAction(formData: unknown) {
  const session = await requireRole(["staff", "admin"]);
  const parsed = updateApplicationStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid status payload" };
  }

  try {
    const updated = await transitionApplicationStatus({
      applicationId: parsed.data.applicationId,
      toStatus: parsed.data.status,
      actorId: session.user.id,
      actorName: session.user.name,
      reason: parsed.data.reason,
      nextFollowUpAt: parsed.data.nextFollowUpAt ? new Date(parsed.data.nextFollowUpAt) : null,
      visitAt: parsed.data.visitAt ? new Date(parsed.data.visitAt) : null,
    });

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${parsed.data.applicationId}`);
    return { success: true, application: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update application status.";
    return { success: false, error: msg };
  }
}

export async function adminUpdateEnquiryStatusAction(formData: unknown) {
  const session = await requireRole(["staff", "admin"]);
  const parsed = updateEnquiryStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid payload" };
  }

  try {
    const [current] = await db
      .select()
      .from(enquiries)
      .where(eq(enquiries.id, parsed.data.enquiryId))
      .limit(1);

    if (!current) throw new Error("Enquiry not found");

    const fromStatus = current.status;
    const [updated] = await db
      .update(enquiries)
      .set({
        status: parsed.data.status,
        nextFollowUpAt: parsed.data.nextFollowUpAt ? new Date(parsed.data.nextFollowUpAt) : current.nextFollowUpAt,
        updatedAt: new Date(),
      })
      .where(eq(enquiries.id, parsed.data.enquiryId))
      .returning();

    await db.insert(statusEvents).values({
      entityType: "enquiry",
      entityId: current.id,
      fromStatus,
      toStatus: parsed.data.status,
      actorId: session.user.id,
      actorName: session.user.name,
      reason: "Status updated by staff",
    });

    revalidatePath("/admin/enquiries");
    return { success: true, enquiry: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update enquiry.";
    return { success: false, error: msg };
  }
}

export async function adminUpdateSubmissionStatusAction(formData: unknown) {
  const session = await requireRole(["staff", "admin"]);
  const parsed = updateSubmissionStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid payload" };
  }

  try {
    const updated = await transitionSubmissionStatus({
      submissionId: parsed.data.submissionId,
      toStatus: parsed.data.status,
      actorId: session.user.id,
      actorName: session.user.name,
      reason: parsed.data.reason,
    });

    revalidatePath("/admin/submissions");
    revalidatePath("/admin/listings");
    return { success: true, submission: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update submission.";
    return { success: false, error: msg };
  }
}

export async function adminUpdateWalkthroughStatusAction(formData: unknown) {
  const session = await requireRole(["staff", "admin"]);
  const parsed = updateWalkthroughStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid payload" };
  }

  try {
    const [current] = await db
      .select()
      .from(walkthroughRequests)
      .where(eq(walkthroughRequests.id, parsed.data.walkthroughId))
      .limit(1);

    if (!current) throw new Error("Walkthrough request not found");

    const fromStatus = current.status;
    const [updated] = await db
      .update(walkthroughRequests)
      .set({
        status: parsed.data.status,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : current.scheduledAt,
        updatedAt: new Date(),
      })
      .where(eq(walkthroughRequests.id, parsed.data.walkthroughId))
      .returning();

    await db.insert(statusEvents).values({
      entityType: "walkthrough_request",
      entityId: current.id,
      fromStatus,
      toStatus: parsed.data.status,
      actorId: session.user.id,
      actorName: session.user.name,
    });

    revalidatePath("/admin/walkthroughs");
    return { success: true, walkthrough: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update walkthrough request.";
    return { success: false, error: msg };
  }
}

export async function adminAddNoteAction(formData: unknown) {
  const session = await requireRole(["staff", "admin"]);
  const parsed = addNoteSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid note" };
  }

  try {
    const [inserted] = await db
      .insert(notes)
      .values({
        entityType: parsed.data.entityType,
        entityId: parsed.data.entityId,
        authorId: session.user.id,
        authorName: session.user.name,
        noteText: parsed.data.noteText,
        isPrivate: parsed.data.isPrivate,
      })
      .returning();

    revalidatePath(`/admin/${parsed.data.entityType}s`);
    return { success: true, note: inserted };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to add note.";
    return { success: false, error: msg };
  }
}

export async function adminAssignEntityAction(formData: unknown) {
  const session = await requireRole(["staff", "admin"]);
  const parsed = assignEntitySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid assignment" };
  }

  try {
    if (parsed.data.entityType === "application") {
      await db
        .update(applications)
        .set({ assignedTo: parsed.data.assignedTo, updatedAt: new Date() })
        .where(eq(applications.id, parsed.data.entityId));
    } else if (parsed.data.entityType === "enquiry") {
      await db
        .update(enquiries)
        .set({ assignedTo: parsed.data.assignedTo, updatedAt: new Date() })
        .where(eq(enquiries.id, parsed.data.entityId));
    } else if (parsed.data.entityType === "owner_submission") {
      await db
        .update(ownerSubmissions)
        .set({ assignedTo: parsed.data.assignedTo, updatedAt: new Date() })
        .where(eq(ownerSubmissions.id, parsed.data.entityId));
    } else if (parsed.data.entityType === "walkthrough_request") {
      await db
        .update(walkthroughRequests)
        .set({ assignedTo: parsed.data.assignedTo, updatedAt: new Date() })
        .where(eq(walkthroughRequests.id, parsed.data.entityId));
    }

    // Record audit log for assignment
    await db.insert(auditLog).values({
      actorId: session.user.id,
      actorName: session.user.name,
      action: "entity_assigned",
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId,
      detailsJson: { assignedTo: parsed.data.assignedTo },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to assign entity.";
    return { success: false, error: msg };
  }
}

export async function adminUpdateUserRoleAction(targetUserId: string, newRole: "user" | "staff" | "admin") {
  const session = await requireRole(["admin"]); // Only full admin can alter roles

  try {
    const [targetUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    // Guard: Prevent demoting the last active admin
    if (targetUser.role === "admin" && newRole !== "admin") {
      const activeAdmins = await db
        .select()
        .from(user)
        .where(and(eq(user.role, "admin"), eq(user.disabled, false)));

      if (activeAdmins.length <= 1) {
        return {
          success: false,
          error: "Action rejected: System must have at least one active administrator.",
        };
      }
    }

    await db
      .update(user)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(user.id, targetUserId));

    await db.insert(auditLog).values({
      actorId: session.user.id,
      actorName: session.user.name,
      action: "user_role_changed",
      entityType: "user",
      entityId: targetUserId,
      detailsJson: { fromRole: targetUser.role, newRole },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update user role.";
    return { success: false, error: msg };
  }
}
