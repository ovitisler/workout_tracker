import "server-only";

import { and, asc, desc, eq, gte, max, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { entries, exercises } from "@/db/schema";
import { localToday } from "@/lib/entry-format";
import { addDays, OVERVIEW_DAYS } from "@/lib/overview";

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

// The exercises the user has logged, most recently logged first, each with its
// latest entry (the first entry of its most recent day, like the log form's
// pre-fill). All of them unless `limit` is given.
export async function listRecentExercises(userId: string, limit?: number) {
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

// Data for the Stats overview: the last OVERVIEW_DAYS of entries (by the
// server's date; the client picks its own "today" within them), and every
// exercise the user has logged with its best estimated 1RM from before that.
// The estimate matches estimateOneRepMax() in stats.ts.
export async function getOverview(userId: string) {
  const since = addDays(localToday(), -OVERVIEW_DAYS);
  const db = getDb();
  const [recent, logged] = await Promise.all([
    db
      .select({
        date: entries.date,
        exerciseId: entries.exerciseId,
        sets: entries.sets,
        reps: entries.reps,
        weight: entries.weight,
      })
      .from(entries)
      .where(and(eq(entries.userId, userId), gte(entries.date, since))),
    db
      .select({
        id: exercises.id,
        name: exercises.name,
        muscleGroup: exercises.muscleGroup,
        earlierBest: max(
          sql`case when ${entries.date} < ${since} then
            case when ${entries.reps} <= 1 then ${entries.weight}
            else ${entries.weight} * (1 + ${entries.reps} / 30.0) end end`,
        ).mapWith(Number),
      })
      .from(entries)
      .innerJoin(exercises, eq(exercises.id, entries.exerciseId))
      .where(eq(entries.userId, userId))
      .groupBy(exercises.id),
  ]);
  return { entries: recent, exercises: logged };
}

export type Overview = Awaited<ReturnType<typeof getOverview>>;
