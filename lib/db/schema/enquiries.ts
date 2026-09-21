import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { enquiryCategory, enquiryStatus } from "./enums";
import { listings } from "./listings";
import { user } from "./auth";

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(), // e.g. Q-26-000045
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(), // Normalised E.164 (+91...)
    category: enquiryCategory("category").notNull(),
    message: text("message").notNull(),
    source: text("source").notNull(), // e.g. "/contact", "/properties/sarvani-heights-3bhk"
    listingId: uuid("listing_id").references(() => listings.id, {
      onDelete: "set null",
    }),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    status: enquiryStatus("status").notNull().default("new"),
    assignedTo: text("assigned_to").references(() => user.id, {
      onDelete: "set null",
    }),
    nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("enquiries_status_created_idx").on(table.status, table.createdAt),
    index("enquiries_category_status_idx").on(table.category, table.status),
    index("enquiries_assigned_status_idx").on(table.assignedTo, table.status),
  ]
);
