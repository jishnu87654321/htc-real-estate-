CREATE TYPE "public"."application_intent" AS ENUM('rent', 'buy');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('submitted', 'contacted', 'visit_scheduled', 'visit_done', 'negotiating', 'approved', 'closed_won', 'closed_lost', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."enquiry_category" AS ENUM('find_home', 'list_property', 'community', 'support', 'billing', 'partnership', 'other');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'in_progress', 'contacted', 'resolved', 'spam');--> statement-breakpoint
CREATE TYPE "public"."listing_intent" AS ENUM('rent', 'sale');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'pending_review', 'active', 'reserved', 'rented', 'sold', 'archived', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('submitted', 'under_review', 'verification_scheduled', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'staff', 'admin');--> statement-breakpoint
CREATE TYPE "public"."walkthrough_status" AS ENUM('new', 'contacted', 'scheduled', 'completed', 'won', 'lost');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"phone" text,
	"disabled" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"locality" text NOT NULL,
	"city" text NOT NULL,
	"total_homes" integer,
	"managed_since" date,
	"amenities" text[],
	"avg_resolution_hours" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "communities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "listing_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"image_key" text NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"alt" text,
	"focal_x" numeric,
	"focal_y" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"intent" "listing_intent" NOT NULL,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"bhk" smallint,
	"property_type" text,
	"area_sqft" integer,
	"floor" smallint,
	"total_floors" smallint,
	"facing" text,
	"furnishing" text,
	"price" integer NOT NULL,
	"deposit" integer,
	"maintenance" integer,
	"available_from" date,
	"tenant_preference" text[],
	"amenities" text[],
	"pet_friendly" boolean DEFAULT false,
	"parking" boolean DEFAULT true,
	"community_id" uuid,
	"locality" text NOT NULL,
	"city" text NOT NULL,
	"description" text,
	"owner_user_id" text,
	"submission_id" uuid,
	"verified_at" timestamp with time zone,
	"verified_by_name" text,
	"published_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"listing_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"intent" "application_intent" NOT NULL,
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"move_in_date" date,
	"budget" integer,
	"occupants" smallint,
	"message" text,
	"contact_phone" text NOT NULL,
	"assigned_to" text,
	"next_follow_up_at" timestamp with time zone,
	"visit_at" timestamp with time zone,
	"close_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"category" "enquiry_category" NOT NULL,
	"message" text NOT NULL,
	"source" text NOT NULL,
	"listing_id" uuid,
	"user_id" text,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"assigned_to" text,
	"next_follow_up_at" timestamp with time zone,
	"consent_at" timestamp with time zone NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "enquiries_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "owner_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"user_id" text,
	"owner_name" text NOT NULL,
	"owner_email" text NOT NULL,
	"owner_phone" text NOT NULL,
	"locality" text NOT NULL,
	"city" text DEFAULT 'Hyderabad' NOT NULL,
	"community_name" text,
	"bhk" smallint,
	"property_type" text,
	"area_sqft" integer,
	"floor" smallint,
	"total_floors" smallint,
	"furnishing" text,
	"price" integer NOT NULL,
	"deposit" integer,
	"maintenance" integer,
	"available_from" date,
	"tenant_preference" text[],
	"photos_requested" boolean DEFAULT false,
	"status" "submission_status" DEFAULT 'submitted' NOT NULL,
	"assigned_to" text,
	"created_listing_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "owner_submissions_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "walkthrough_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"community_name" text NOT NULL,
	"number_of_homes" integer,
	"role" text,
	"city" text NOT NULL,
	"status" "walkthrough_status" DEFAULT 'new' NOT NULL,
	"assigned_to" text,
	"scheduled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "walkthrough_requests_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text,
	"actor_name" text NOT NULL,
	"ip_address" text,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"details_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"note_text" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"hits" integer DEFAULT 1 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reference_counters" (
	"prefix" text NOT NULL,
	"year" integer NOT NULL,
	"current_val" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reference_counters_prefix_year_pk" PRIMARY KEY("prefix","year")
);
--> statement-breakpoint
CREATE TABLE "saved_listings" (
	"user_id" text NOT NULL,
	"listing_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_listings_user_id_listing_id_pk" PRIMARY KEY("user_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "status_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"actor_id" text,
	"actor_name" text NOT NULL,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_submissions" ADD CONSTRAINT "owner_submissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_submissions" ADD CONSTRAINT "owner_submissions_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_submissions" ADD CONSTRAINT "owner_submissions_created_listing_id_listings_id_fk" FOREIGN KEY ("created_listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "walkthrough_requests" ADD CONSTRAINT "walkthrough_requests_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_images_listing_id_sort_idx" ON "listing_images" USING btree ("listing_id","sort_order");--> statement-breakpoint
CREATE INDEX "listings_status_city_intent_idx" ON "listings" USING btree ("status","city","intent");--> statement-breakpoint
CREATE INDEX "listings_status_locality_idx" ON "listings" USING btree ("status","locality");--> statement-breakpoint
CREATE INDEX "listings_status_price_idx" ON "listings" USING btree ("status","price");--> statement-breakpoint
CREATE INDEX "listings_community_id_idx" ON "listings" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "applications_status_created_idx" ON "applications" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "applications_listing_id_idx" ON "applications" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "applications_user_id_created_idx" ON "applications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "applications_assigned_status_idx" ON "applications" USING btree ("assigned_to","status");--> statement-breakpoint
CREATE UNIQUE INDEX "applications_one_open_per_user_listing" ON "applications" USING btree ("listing_id","user_id") WHERE status NOT IN ('closed_won', 'closed_lost', 'withdrawn');--> statement-breakpoint
CREATE INDEX "enquiries_status_created_idx" ON "enquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "enquiries_category_status_idx" ON "enquiries" USING btree ("category","status");--> statement-breakpoint
CREATE INDEX "enquiries_assigned_status_idx" ON "enquiries" USING btree ("assigned_to","status");--> statement-breakpoint
CREATE INDEX "owner_submissions_status_created_idx" ON "owner_submissions" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "owner_submissions_user_id_idx" ON "owner_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "walkthrough_requests_status_created_idx" ON "walkthrough_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "notes_entity_idx" ON "notes" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "notes_created_at_idx" ON "notes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "rate_limits_expires_idx" ON "rate_limits" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "saved_listings_user_id_idx" ON "saved_listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "status_events_entity_idx" ON "status_events" USING btree ("entity_type","entity_id","created_at");