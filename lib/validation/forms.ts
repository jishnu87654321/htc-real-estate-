import { z } from "zod";

// Phone number regex for Indian / international numbers (+91 or 10 digits)
export const phoneRegex = /^(\+91[\s-]?)?[6789]\d{9}$/;

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  return raw.trim();
}

export function getSafeReturnTo(url: string | null | undefined, defaultUrl: string = "/account"): string {
  if (!url || typeof url !== "string") return defaultUrl;
  const trimmed = url.trim();
  // Safe relative URL: starts with / and not // or /\ and does not contain protocol
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes("://") &&
    !trimmed.toLowerCase().startsWith("javascript:") &&
    !trimmed.toLowerCase().startsWith("data:")
  ) {
    return trimmed;
  }
  return defaultUrl;
}

// 1. Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  returnTo: z
    .string()
    .optional()
    .transform((val) => getSafeReturnTo(val, "/account")),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(phoneRegex, "Please enter a valid 10-digit Indian phone number").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  returnTo: z
    .string()
    .optional()
    .transform((val) => getSafeReturnTo(val, "/account")),
});

// 2. Contact / General Enquiry Schema
export const contactEnquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(phoneRegex, "Please enter a valid 10-digit Indian phone number"),
  category: z.enum([
    "find_home",
    "list_property",
    "community",
    "support",
    "billing",
    "partnership",
    "other",
  ]),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  source: z.string().default("/contact"),
  listingId: z.string().uuid().optional().nullable(),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to being contacted by HTC",
  }),
  website_hp: z.string().max(0, "Bot detected").optional(), // Honeypot field
});

// 3. Owner Listing Submission Schema (/list-your-property)
export const ownerSubmissionSchema = z.object({
  ownerName: z.string().min(2, "Name must be at least 2 characters"),
  ownerEmail: z.string().email("Please enter a valid email address"),
  ownerPhone: z.string().regex(phoneRegex, "Please enter a valid 10-digit Indian phone number"),
  locality: z.string().min(2, "Locality is required"),
  city: z.string().default("Hyderabad"),
  communityName: z.string().optional(),
  bhk: z.coerce.number().int().min(1).max(10).optional(),
  propertyType: z.string().default("Apartment"),
  areaSqft: z.coerce.number().int().positive().optional(),
  floor: z.coerce.number().int().min(0).max(100).optional(),
  totalFloors: z.coerce.number().int().min(1).max(100).optional(),
  furnishing: z.enum(["Unfurnished", "Semi-Furnished", "Fully Furnished"]).default("Semi-Furnished"),
  price: z.coerce.number().int().positive("Price must be greater than 0"),
  deposit: z.coerce.number().int().positive().optional(),
  maintenance: z.coerce.number().int().min(0).optional(),
  availableFrom: z.string().optional(),
  tenantPreference: z.array(z.string()).optional(),
  photosRequested: z.boolean().default(false),
  website_hp: z.string().max(0, "Bot detected").optional(), // Honeypot field
});

// 4. Community Walkthrough Request Schema (/communities)
export const walkthroughRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(phoneRegex, "Please enter a valid 10-digit Indian phone number"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  communityName: z.string().min(2, "Society or community name is required"),
  numberOfHomes: z.coerce.number().int().positive().optional(),
  role: z.string().optional(), // e.g. "RWA President", "Committee Member", "Owner"
  city: z.string().default("Hyderabad"),
  website_hp: z.string().max(0, "Bot detected").optional(), // Honeypot field
});

// 5. Property Application Schema (/properties/[slug] -> Apply)
export const applicationSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),
  intent: z.enum(["rent", "buy"]),
  moveInDate: z.string().min(4, "Please select expected move-in date"),
  budget: z.coerce.number().int().positive("Budget must be a valid amount"),
  occupants: z.coerce.number().int().min(1).max(20).default(1),
  contactPhone: z.string().regex(phoneRegex, "Please enter a valid 10-digit Indian phone number"),
  message: z.string().max(1000).optional(),
});

// 6. Admin Action Schemas
export const updateApplicationStatusSchema = z
  .object({
    applicationId: z.string().uuid(),
    status: z.enum([
      "submitted",
      "contacted",
      "visit_scheduled",
      "visit_done",
      "negotiating",
      "approved",
      "closed_won",
      "closed_lost",
      "withdrawn",
    ]),
    reason: z.string().optional(),
    nextFollowUpAt: z.string().optional().nullable(),
    visitAt: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "visit_scheduled" && (!data.visitAt || data.visitAt.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Visit date and time is required when scheduling a visit.",
        path: ["visitAt"],
      });
    }
    if ((data.status === "closed_lost" || data.status === "withdrawn") && (!data.reason || data.reason.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A reason is required when marking an application as closed lost or withdrawn.",
        path: ["reason"],
      });
    }
  });

export const updateEnquiryStatusSchema = z.object({
  enquiryId: z.string().uuid(),
  status: z.enum(["new", "in_progress", "contacted", "resolved", "spam"]),
  nextFollowUpAt: z.string().optional().nullable(),
});

export const updateSubmissionStatusSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(["submitted", "under_review", "verification_scheduled", "approved", "rejected"]),
  reason: z.string().optional(),
});

export const updateWalkthroughStatusSchema = z
  .object({
    walkthroughId: z.string().uuid(),
    status: z.enum(["new", "contacted", "scheduled", "completed", "won", "lost"]),
    scheduledAt: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "scheduled" && (!data.scheduledAt || data.scheduledAt.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled date and time is required when scheduling a walkthrough.",
        path: ["scheduledAt"],
      });
    }
  });

export const addNoteSchema = z.object({
  entityType: z.enum(["application", "enquiry", "owner_submission", "walkthrough_request", "listing", "user"]),
  entityId: z.string(),
  noteText: z.string().min(1, "Note cannot be empty").max(2000),
  isPrivate: z.boolean().default(false),
});

export const assignEntitySchema = z.object({
  entityType: z.enum(["application", "enquiry", "owner_submission", "walkthrough_request"]),
  entityId: z.string().uuid(),
  assignedTo: z.string().nullable(),
});
