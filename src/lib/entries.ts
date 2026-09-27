import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { entries, exercises } from "@/db/schema";

export type Entry = Awaited<ReturnType<typeof listEntries>>[number];

// Newest day first; within a day, in the order they were logged.
export function listEntries(userId: string, exerciseId: number) {
  return getDb()
    .select({
      id: entries.id,
      date: entries.date,
      sets: entries.sets,
      reps: entries.reps,
      weight: entries.weight,
    })
    .from(entries)
    .where(and(eq(entries.userId, userId), eq(entries.exerciseId, exerciseId)))
    .orderBy(desc(entries.date), asc(entries.id));
}

// The exercises the user logged most recently, newest first, each with its
// latest entry (the first entry of its most recent day, like the log form's
// pre-fill).
export async function listRecentExercises(userId: string, limit = 6) {
  const latest = await getDb()
    .selectDistinctOn([entries.exerciseId], {
      id: exercises.id,
      name: exercises.name,
      date: entries.date,
      sets: entries.sets,
      reps: entries.reps,
      weight: entries.weight,
    })
    .from(entries)
    .innerJoin(exercises, eq(exercises.id, entries.exerciseId))
    .where(eq(entries.userId, userId))
    .orderBy(entries.exerciseId, desc(entries.date), asc(entries.id));
  return latest
    .sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ id, name, ...entry }) => ({ id, name, latest: entry }));
}

export type RecentExercise = Awaited<ReturnType<typeof listRecentExercises>>[number];
