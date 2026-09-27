CREATE TYPE "public"."access_request_status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TABLE "access_requests" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "access_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" text NOT NULL,
	"note" text,
	"status" "access_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE UNIQUE INDEX "access_requests_email_unique" ON "access_requests" USING btree (lower("email"));