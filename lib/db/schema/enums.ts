import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "staff", "admin"]);

export const listingIntent = pgEnum("listing_intent", ["rent", "sale"]);

export const listingStatus = pgEnum("listing_status", [
  "draft",
  "pending_review",
  "active",
  "reserved",
  "rented",
  "sold",
  "archived",
  "rejected",
]);

export const applicationIntent = pgEnum("application_intent", ["rent", "buy"]);

export const applicationStatus = pgEnum("application_status", [
  "submitted",
  "contacted",
  "visit_scheduled",
  "visit_done",
  "negotiating",
  "approved",
  "closed_won",
  "closed_lost",
  "withdrawn",
]);

export const enquiryCategory = pgEnum("enquiry_category", [
  "find_home",
  "list_property",
  "community",
  "support",
  "billing",
  "partnership",
  "other",
]);

export const enquiryStatus = pgEnum("enquiry_status", [
  "new",
  "in_progress",
  "contacted",
  "resolved",
  "spam",
]);

export const submissionStatus = pgEnum("submission_status", [
  "submitted",
  "under_review",
  "verification_scheduled",
  "approved",
  "rejected",
]);

export const walkthroughStatus = pgEnum("walkthrough_status", [
  "new",
  "contacted",
  "scheduled",
  "completed",
  "won",
  "lost",
]);
