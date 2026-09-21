import {
  pgTable,
  uuid,
  text,
  integer,
  smallint,
  date,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { submissionStatus } from "./enums";
import { user } from "./auth";
import { listings } from "./listings";

export const ownerSubmissions = pgTable(
  "owner_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(), // e.g. L-26-000012
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ownerName: text("owner_name").notNull(),
    ownerEmail: text("owner_email").notNull(),
    ownerPhone: text("owner_phone").notNull(),
    locality: text("locality").notNull(),
    city: text("city").notNull().default("Hyderabad"),
    communityName: text("community_name"),
    bhk: smallint("bhk"),
    propertyType: text("property_type"),
    areaSqft: integer("area_sqft"),
    floor: smallint("floor"),
    totalFloors: smallint("total_floors"),
    furnishing: text("furnishing"),
    price: integer("price").notNull(),
    deposit: integer("deposit"),
    maintenance: integer("maintenance"),
    availableFrom: date("available_from"),
    tenantPreference: text("tenant_preference").array(),
    photosRequested: boolean("photos_requested").default(false),
    status: submissionStatus("status").notNull().default("submitted"),
    assignedTo: text("assigned_to").references(() => user.id, {
      onDelete: "set null",
    }),
    createdListingId: uuid("created_listing_id").references(() => listings.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("owner_submissions_status_created_idx").on(table.status, table.createdAt),
    index("owner_submissions_user_id_idx").on(table.userId),
  ]
);
