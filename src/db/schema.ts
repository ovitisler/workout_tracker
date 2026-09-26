import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const exercises = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  performedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  notes: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const sets = pgTable("sets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer()
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: integer()
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  reps: integer(),
  weight: numeric({ precision: 6, scale: 2 }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
