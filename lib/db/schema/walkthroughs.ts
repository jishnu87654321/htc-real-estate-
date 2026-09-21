import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { walkthroughStatus } from "./enums";
import { user } from "./auth";

export const walkthroughRequests = pgTable(
  "walkthrough_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(), // e.g. W-26-000021
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    communityName: text("community_name").notNull(),
    numberOfHomes: integer("number_of_homes"),
    role: text("role"),
    city: text("city").notNull(),
    status: walkthroughStatus("status").notNull().default("new"),
    assignedTo: text("assigned_to").references(() => user.id, {
      onDelete: "set null",
    }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("walkthrough_requests_status_created_idx").on(table.status, table.createdAt),
  ]
);
