CREATE TYPE "public"."user_role" AS ENUM('admin', 'operator', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."cargo_type" AS ENUM('FCL', 'LCL');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'done');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('D2D', 'D2P');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('Pending', 'Booked', 'Picked Up', 'At POL', 'Loaded', 'Departed', 'At POD', 'Unloaded', 'Customs', 'Out-Gate', 'Delivered', 'Returned');--> statement-breakpoint
CREATE TYPE "public"."import_batch_status" AS ENUM('uploaded', 'parsing', 'ready', 'committing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."import_row_status" AS ENUM('valid', 'invalid', 'imported', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."integration_delivery_status" AS ENUM('pending', 'processing', 'succeeded', 'retry_scheduled', 'failed', 'dead');--> statement-breakpoint
CREATE TYPE "public"."integration_operation" AS ENUM('shipment_attributes', 'shipment_event');--> statement-breakpoint
CREATE TABLE "refresh_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"date_time" timestamp with time zone,
	"location" text,
	"notes" text,
	"photo_file_id" uuid,
	"last_updated_at" timestamp with time zone,
	"updated_by_id" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment_containers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"reference" text NOT NULL,
	"container" text NOT NULL,
	"container_type" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"bol" text DEFAULT '' NOT NULL,
	"hbol" text DEFAULT '' NOT NULL,
	"carrier" text DEFAULT '' NOT NULL,
	"carrier_scac" text DEFAULT '' NOT NULL,
	"vessel" text DEFAULT '' NOT NULL,
	"voyage" text DEFAULT '' NOT NULL,
	"movement_type" "movement_type" DEFAULT 'D2D' NOT NULL,
	"status" "shipment_status" DEFAULT 'Pending' NOT NULL,
	"shipper" text DEFAULT '' NOT NULL,
	"consignee" text DEFAULT '' NOT NULL,
	"pol" text DEFAULT '' NOT NULL,
	"pod" text DEFAULT '' NOT NULL,
	"etd" text NOT NULL,
	"eta" text NOT NULL,
	"cargo_type" "cargo_type" DEFAULT 'FCL' NOT NULL,
	"container_size" text DEFAULT '' NOT NULL,
	"weight" text DEFAULT '' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"milestone_id" uuid,
	"type" text NOT NULL,
	"filename" text NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"description" text,
	"uploaded_by_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"status" "import_batch_status" DEFAULT 'uploaded' NOT NULL,
	"total_rows" integer DEFAULT 0 NOT NULL,
	"valid_rows" integer DEFAULT 0 NOT NULL,
	"invalid_rows" integer DEFAULT 0 NOT NULL,
	"imported_rows" integer DEFAULT 0 NOT NULL,
	"skipped_rows" integer DEFAULT 0 NOT NULL,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "import_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"row_number" integer NOT NULL,
	"status" "import_row_status" DEFAULT 'valid' NOT NULL,
	"reference" text,
	"container" text,
	"raw_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"description" text NOT NULL,
	"shipment_id" uuid,
	"user_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"milestone_id" uuid,
	"operation" "integration_operation" NOT NULL,
	"status" "integration_delivery_status" DEFAULT 'pending' NOT NULL,
	"http_status" integer,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"idempotency_key" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"response" jsonb,
	"error_message" text,
	"correlation_id" text,
	"next_retry_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_containers" ADD CONSTRAINT "shipment_containers_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_batch_id_import_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."import_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_deliveries" ADD CONSTRAINT "integration_deliveries_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_deliveries" ADD CONSTRAINT "integration_deliveries_milestone_id_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "reference_container_unique" ON "shipment_containers" USING btree ("reference","container");--> statement-breakpoint
CREATE UNIQUE INDEX "integration_deliveries_idempotency_key_unique" ON "integration_deliveries" USING btree ("idempotency_key");