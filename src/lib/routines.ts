import "server-only";

import { and, asc, desc, eq, inArray, max, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { entries, exercises, routineExercises, routines } from "@/db/schema";

export function getRoutine(userId: string, routineId: number) {
  return getDb()
    .select({ id: routines.id, name: routines.name })
    .from(routines)
    .where(and(eq(routines.id, routineId), eq(routines.userId, userId)))
    .then(([row]) => row);
}

// All the user's routines, each with its exercise names (in order), each
// exercise's most recent log date (so the page can count what's done today),
// and when the routine was last done.
export async function listRoutines(userId: string) {
  const db = getDb();
  const [rows, items, latest, lastDone] = await Promise.all([
    db
      .select({ id: routines.id, name: routines.name })
      .from(routines)
      .where(eq(routines.userId, userId))
      .orderBy(asc(routines.position), asc(routines.id)),
    db
      .select({
        routineId: routineExercises.routineId,
        exerciseId: routineExercises.exerciseId,
        name: exercises.name,
      })
      .from(routineExercises)
      .innerJoin(routines, eq(routines.id, routineExercises.routineId))
      .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
      .where(eq(routines.userId, userId))
      .orderBy(asc(routineExercises.position)),
    db
      .select({ exerciseId: entries.exerciseId, date: max(entries.date) })
      .from(entries)
      .where(eq(entries.userId, userId))
      .groupBy(entries.exerciseId),
    lastDoneDates(userId),
  ]);
  const latestDate = new Map(latest.map((l) => [l.exerciseId, l.date]));
  return rows.map((routine) => {
    const own = items.filter((item) => item.routineId === routine.id);
    return {
      ...routine,
      exerciseNames: own.map((item) => item.name),
      lastLogged: own.map((item) => latestDate.get(item.exerciseId) ?? null),
      lastDone: lastDone.get(routine.id) ?? null,
    };
  });
}

// The most recent day each routine was "done": at least half of its exercises
// were logged that day. Half rather than any, so an exercise shared between
// routines (Squat in both "Lower 1" and "Lower 2") doesn't mark both as done.
async function lastDoneDates(userId: string) {
  const perDay = getDb()
    .select({
      routineId: routineExercises.routineId,
      date: entries.date,
      logged: sql<number>`count(distinct ${entries.exerciseId})`.as("logged"),
      total: sql<number>`(select count(*) from ${routineExercises} as re2 where re2.routine_id = ${routineExercises.routineId})`.as(
        "total",
      ),
    })
    .from(routineExercises)
    .innerJoin(
      entries,
      and(eq(entries.exerciseId, routineExercises.exerciseId), eq(entries.userId, userId)),
    )
    .groupBy(routineExercises.routineId, entries.date)
    .as("per_day");
  const rows = await getDb()
    .select({ routineId: perDay.routineId, date: max(perDay.date) })
    .from(perDay)
    .where(sql`${perDay.logged} * 2 >= ${perDay.total}`)
    .groupBy(perDay.routineId);
  return new Map(rows.map((r) => [r.routineId, r.date]));
}

// A routine's exercises in order, each with its latest entry (the first entry
// of the most recent day, same as the log form's pre-fill).
export async function listRoutineExercises(userId: string, routineId: number) {
  const db = getDb();
  const items = await db
    .select({
      id: exercises.id,
      name: exercises.name,
      muscleGroup: exercises.muscleGroup,
    })
    .from(routineExercises)
    .innerJoin(routines, eq(routines.id, routineExercises.routineId))
    .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
    .where(and(eq(routineExercises.routineId, routineId), eq(routines.userId, userId)))
    .orderBy(asc(routineExercises.position));

  if (items.length === 0) return [];

  const latest = await db
    .selectDistinctOn([entries.exerciseId], {
      exerciseId: entries.exerciseId,
      date: entries.date,
      sets: entries.sets,
      reps: entries.reps,
      weight: entries.weight,
    })
    .from(entries)
    .where(
      and(
        eq(entries.userId, userId),
        inArray(
          entries.exerciseId,
          items.map((i) => i.id),
        ),
      ),
    )
    .orderBy(entries.exerciseId, desc(entries.date), asc(entries.id));

  const byExercise = new Map(latest.map((l) => [l.exerciseId, l]));
  return items.map((item) => ({ ...item, latest: byExercise.get(item.id) ?? null }));
}

export type RoutineExercise = Awaited<ReturnType<typeof listRoutineExercises>>[number];
