import {
  pgTable,
  uuid,
  text,
  integer,
  smallint,
  date,
  timestamp,
  numeric,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { listingIntent, listingStatus } from "./enums";
import { communities } from "./communities";
import { user } from "./auth";

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    intent: listingIntent("intent").notNull(),
    status: listingStatus("status").notNull().default("draft"),
    bhk: smallint("bhk"),
    propertyType: text("property_type"),
    areaSqft: integer("area_sqft"),
    floor: smallint("floor"),
    totalFloors: smallint("total_floors"),
    facing: text("facing"),
    furnishing: text("furnishing"),
    price: integer("price").notNull(), // Rent per month or sale price in INR
    deposit: integer("deposit"),
    maintenance: integer("maintenance"), // Monthly maintenance in INR
    availableFrom: date("available_from"),
    tenantPreference: text("tenant_preference").array(),
    amenities: text("amenities").array(),
    petFriendly: boolean("pet_friendly").default(false),
    parking: boolean("parking").default(true),
    communityId: uuid("community_id").references(() => communities.id, {
      onDelete: "set null",
    }),
    locality: text("locality").notNull(),
    city: text("city").notNull(),
    description: text("description"),
    ownerUserId: text("owner_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    submissionId: uuid("submission_id"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedByName: text("verified_by_name"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("listings_status_city_intent_idx").on(table.status, table.city, table.intent),
    index("listings_status_locality_idx").on(table.status, table.locality),
    index("listings_status_price_idx").on(table.status, table.price),
    index("listings_community_id_idx").on(table.communityId),
  ]
);

export const listingImages = pgTable(
  "listing_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    imageKey: text("image_key").notNull(),
    sortOrder: smallint("sort_order").default(0).notNull(),
    alt: text("alt"),
    focalX: numeric("focal_x"),
    focalY: numeric("focal_y"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("listing_images_listing_id_sort_idx").on(table.listingId, table.sortOrder),
  ]
);
