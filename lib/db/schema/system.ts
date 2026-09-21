import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { listings } from "./listings";

// 1. Saved Listings (User Favorites / Bookmarks)
export const savedListings = pgTable(
  "saved_listings",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.listingId] }),
    index("saved_listings_user_id_idx").on(table.userId),
  ]
);

// 2. Internal Staff Notes (attached to any record)
export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull(), // 'application' | 'enquiry' | 'owner_submission' | 'walkthrough_request' | 'listing' | 'user'
    entityId: text("entity_id").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    noteText: text("note_text").notNull(),
    isPrivate: boolean("is_private").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("notes_entity_idx").on(table.entityType, table.entityId),
    index("notes_created_at_idx").on(table.createdAt),
  ]
);

// 3. Status Events (Audit timeline for state machine transitions)
export const statusEvents = pgTable(
  "status_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull(), // 'application' | 'enquiry' | 'owner_submission' | 'walkthrough_request' | 'listing'
    entityId: text("entity_id").notNull(),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    actorName: text("actor_name").notNull(),
    reason: text("reason"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("status_events_entity_idx").on(table.entityType, table.entityId, table.createdAt),
  ]
);

// 4. Audit Log (Security & sensitive administrative actions)
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    actorName: text("actor_name").notNull(),
    ipAddress: text("ip_address"),
    action: text("action").notNull(), // 'login_failed', 'role_changed', 'user_disabled', 'listing_approved', 'lead_exported', etc.
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    detailsJson: jsonb("details_json"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_log_created_idx").on(table.createdAt),
    index("audit_log_actor_idx").on(table.actorId),
    index("audit_log_action_idx").on(table.action),
  ]
);

// 5. Rate Limits (Persistent database counter for sliding/fixed abuse windows)
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(), // e.g. "auth_fail:127.0.0.1", "form_contact:user@domain"
    hits: integer("hits").notNull().default(1),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("rate_limits_expires_idx").on(table.expiresAt),
  ]
);

// 6. Reference Counters (Atomic sequence references)
export const referenceCounters = pgTable(
  "reference_counters",
  {
    prefix: text("prefix").notNull(), // e.g. "APP", "Q", "L", "W"
    year: integer("year").notNull(), // e.g. 26 (2026)
    currentVal: integer("current_val").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.prefix, table.year] }),
  ]
);
