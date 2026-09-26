CREATE TABLE "entries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "entries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"exercise_id" integer NOT NULL,
	"date" date NOT NULL,
	"sets" integer,
	"reps" integer NOT NULL,
	"weight" numeric(6, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entries_sets_positive" CHECK ("entries"."sets" > 0),
	CONSTRAINT "entries_reps_positive" CHECK ("entries"."reps" > 0),
	CONSTRAINT "entries_weight_not_negative" CHECK ("entries"."weight" >= 0)
);
--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entries_user_id_exercise_id_date_index" ON "entries" USING btree ("user_id","exercise_id","date");