CREATE TYPE "public"."muscle_group" AS ENUM('chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'core');--> statement-breakpoint
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_user_id_name_unique";--> statement-breakpoint
ALTER TABLE "exercises" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "muscle_group" "muscle_group" NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "exercises_builtin_name_unique" ON "exercises" USING btree (lower("name")) WHERE "exercises"."user_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "exercises_user_id_name_unique" ON "exercises" USING btree ("user_id",lower("name"));