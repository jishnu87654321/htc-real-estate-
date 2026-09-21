import { pgTable, uuid, text, integer, date, timestamp } from "drizzle-orm/pg-core";

export const communities = pgTable("communities", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  locality: text("locality").notNull(),
  city: text("city").notNull(),
  totalHomes: integer("total_homes"),
  managedSince: date("managed_since"),
  amenities: text("amenities").array(),
  avgResolutionHours: integer("avg_resolution_hours"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
