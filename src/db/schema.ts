import { isNull, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
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

export const workouts = pgTable(
  "workouts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    performedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    notes: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.userId, t.performedAt)],
);

export const sets = pgTable("sets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer()
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  // "no action" (the default) rather than "restrict": both block deleting an
  // exercise that has sets, but "no action" is checked at the end of the
  // statement, so deleting a user (which cascades to workouts, sets and
  // exercises in no particular order) still works.
  exerciseId: integer()
    .notNull()
    .references(() => exercises.id),
  reps: integer(),
  weight: numeric({ precision: 6, scale: 2 }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
