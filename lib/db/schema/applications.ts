import {
  pgTable,
  uuid,
  text,
  integer,
  smallint,
  date,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { applicationIntent, applicationStatus } from "./enums";
import { listings } from "./listings";
import { user } from "./auth";

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(), // e.g. APP-26-000123
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "restrict" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    intent: applicationIntent("intent").notNull(),
    status: applicationStatus("status").notNull().default("submitted"),
    moveInDate: date("move_in_date"),
    budget: integer("budget"),
    occupants: smallint("occupants"),
    message: text("message"),
    contactPhone: text("contact_phone").notNull(),
    assignedTo: text("assigned_to").references(() => user.id, {
      onDelete: "set null",
    }),
    nextFollowUpAt: timestamp("next_follow_up_at", { withTimezone: true }),
    visitAt: timestamp("visit_at", { withTimezone: true }),
    closeReason: text("close_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("applications_status_created_idx").on(table.status, table.createdAt),
    index("applications_listing_id_idx").on(table.listingId),
    index("applications_user_id_created_idx").on(table.userId, table.createdAt),
    index("applications_assigned_status_idx").on(table.assignedTo, table.status),
    uniqueIndex("applications_one_open_per_user_listing")
      .on(table.listingId, table.userId)
      .where(sql`status NOT IN ('closed_won', 'closed_lost', 'withdrawn')`),
  ]
);
