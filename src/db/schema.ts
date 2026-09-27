import { isNull, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { MUSCLE_GROUPS } from "@/lib/muscle-groups";

// --- Auth tables (Better Auth's core schema) ---
// Field names must match what Better Auth expects; see
// https://www.better-auth.com/docs/concepts/database#core-schema

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date()),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index().on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.identifier)],
);

// --- App tables ---

export const muscleGroup = pgEnum("muscle_group", MUSCLE_GROUPS);

// Built-in exercises have no user (seeded by a migration and visible to
// everyone). Custom exercises belong to, and are only visible to, one user.
// Names are unique ignoring case: among built-ins, and within each user's own.
export const exercises = pgTable(
  "exercises",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text().references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    muscleGroup: muscleGroup().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("exercises_builtin_name_unique")
      .on(sql`lower(${t.name})`)
      .where(isNull(t.userId)),
    uniqueIndex("exercises_user_id_name_unique").on(
      t.userId,
      sql`lower(${t.name})`,
    ),
  ],
);

// One line in an exercise's history: "3 × 8 @ 135 lb" on a given day. A day
// can have several entries (e.g. 2 × 8 and 1 × 6 at the same weight).
export const entries = pgTable(
  "entries",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // No cascade: an exercise with history can't be deleted. Deleting a user
    // still works because "no action" is checked at the end of the statement.
    exerciseId: integer()
      .notNull()
      .references(() => exercises.id),
    // The calendar day in the user's timezone, as "YYYY-MM-DD".
    date: date().notNull(),
    // Null means a single set.
    sets: integer(),
    reps: integer().notNull(),
    // Pounds.
    weight: numeric({ precision: 6, scale: 2, mode: "number" }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.userId, t.exerciseId, t.date),
    check("entries_sets_positive", sql`${t.sets} > 0`),
    check("entries_reps_positive", sql`${t.reps} > 0`),
    check("entries_weight_not_negative", sql`${t.weight} >= 0`),
  ],
);

// A named list of exercises the user does together, e.g. "Lower 1".
export const routines = pgTable(
  "routines",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    // Display order among the user's routines.
    position: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("routines_user_id_name_unique").on(t.userId, sql`lower(${t.name})`)],
);

export const routineExercises = pgTable(
  "routine_exercises",
  {
    routineId: integer()
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    exerciseId: integer()
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    // Display order within the routine.
    position: integer().notNull(),
  },
  (t) => [primaryKey({ columns: [t.routineId, t.exerciseId] })],
);

export const accessRequestStatus = pgEnum("access_request_status", [
  "pending",
  "approved",
  "denied",
]);

// People asking to be let in (sign-up is invite-only). An approved email can
// create an account; admins review requests in Settings.
export const accessRequests = pgTable(
  "access_requests",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    email: text().notNull(),
    note: text(),
    status: accessRequestStatus().notNull().default("pending"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    reviewedAt: timestamp({ withTimezone: true }),
  },
  (t) => [uniqueIndex("access_requests_email_unique").on(sql`lower(${t.email})`)],
);
