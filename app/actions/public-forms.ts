"use server";

import {
  contactEnquirySchema,
  ownerSubmissionSchema,
  walkthroughRequestSchema,
  normalizePhone,
} from "@/lib/validation/forms";
import { checkRateLimit, getClientIpHash } from "@/lib/utils/rate-limit";
import {
  createEnquiry,
  createOwnerSubmission,
  createWalkthroughRequest,
} from "@/lib/services/submissions";
import { getServerSession } from "@/lib/auth/session";

export async function submitEnquiryAction(formData: unknown) {
  const parsed = contactEnquirySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid form data" };
  }

  // Honeypot check
  if (parsed.data.website_hp) {
    return { success: true, message: "Thank you for reaching out." };
  }

  const { ipHash } = await getClientIpHash();
  const rate = await checkRateLimit(`enquiry:${ipHash}`, 5, 60 * 60);
  if (!rate.allowed) {
    return {
      success: false,
      error: "You have submitted multiple enquiries recently. Please wait before submitting again.",
    };
  }

  const session = await getServerSession();

  try {
    const record = await createEnquiry({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: normalizePhone(parsed.data.phone),
      category: parsed.data.category,
      message: parsed.data.message,
      source: parsed.data.source,
      listingId: parsed.data.listingId || null,
      userId: session?.user?.id || null,
      ipHash,
    });

    return {
      success: true,
      reference: record.reference,
      message: `Enquiry submitted successfully. Your reference is ${record.reference}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit enquiry.";
    return { success: false, error: msg };
  }
}

export async function submitOwnerSubmissionAction(formData: unknown) {
  const parsed = ownerSubmissionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid form data" };
  }

  if (parsed.data.website_hp) {
    return { success: true, message: "Thank you. Your property details have been recorded." };
  }

  const { ipHash } = await getClientIpHash();
  const rate = await checkRateLimit(`submission:${ipHash}`, 5, 60 * 60);
  if (!rate.allowed) {
    return {
      success: false,
      error: "Rate limit exceeded. Please wait before submitting another property.",
    };
  }

  const session = await getServerSession();

  try {
    const record = await createOwnerSubmission({
      userId: session?.user?.id || null,
      ownerName: parsed.data.ownerName,
      ownerEmail: parsed.data.ownerEmail,
      ownerPhone: normalizePhone(parsed.data.ownerPhone),
      locality: parsed.data.locality,
      city: parsed.data.city,
      communityName: parsed.data.communityName,
      bhk: parsed.data.bhk,
      propertyType: parsed.data.propertyType,
      areaSqft: parsed.data.areaSqft,
      floor: parsed.data.floor,
      totalFloors: parsed.data.totalFloors,
      furnishing: parsed.data.furnishing,
      price: parsed.data.price,
      deposit: parsed.data.deposit,
      maintenance: parsed.data.maintenance,
      availableFrom: parsed.data.availableFrom,
      tenantPreference: parsed.data.tenantPreference,
      photosRequested: parsed.data.photosRequested,
    });

    return {
      success: true,
      reference: record.reference,
      message: `Your property has been submitted under reference ${record.reference}. Our facility manager will review and contact you for verification.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit property.";
    return { success: false, error: msg };
  }
}

export async function submitWalkthroughAction(formData: unknown) {
  const parsed = walkthroughRequestSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid form data" };
  }

  if (parsed.data.website_hp) {
    return { success: true, message: "Thank you. We have received your walkthrough request." };
  }

  const { ipHash } = await getClientIpHash();
  const rate = await checkRateLimit(`walkthrough:${ipHash}`, 5, 60 * 60);
  if (!rate.allowed) {
    return {
      success: false,
      error: "Too many requests. Please try again later.",
    };
  }

  try {
    const record = await createWalkthroughRequest({
      name: parsed.data.name,
      phone: normalizePhone(parsed.data.phone),
      email: parsed.data.email || undefined,
      communityName: parsed.data.communityName,
      numberOfHomes: parsed.data.numberOfHomes,
      role: parsed.data.role,
      city: parsed.data.city,
    });

    return {
      success: true,
      reference: record.reference,
      message: `Walkthrough request received (${record.reference}). Our team will coordinate a society visit.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit walkthrough request.";
    return { success: false, error: msg };
  }
}
