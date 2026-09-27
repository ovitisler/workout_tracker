import "server-only";

import { and, asc, desc, eq, inArray, max } from "drizzle-orm";

import { getDb } from "@/db";
import { entries, exercises, routineExercises, routines } from "@/db/schema";

export function getRoutine(userId: string, routineId: number) {
  return getDb()
    .select({ id: routines.id, name: routines.name })
    .from(routines)
    .where(and(eq(routines.id, routineId), eq(routines.userId, userId)))
    .then(([row]) => row);
}

// All the user's routines, each with its exercises' most recent log dates
// (so the page can show how many are done today).
export async function listRoutines(userId: string) {
  const db = getDb();
  const [rows, items, latest] = await Promise.all([
    db
      .select({ id: routines.id, name: routines.name })
      .from(routines)
      .where(eq(routines.userId, userId))
      .orderBy(asc(routines.position), asc(routines.id)),
    db
      .select({ routineId: routineExercises.routineId, exerciseId: routineExercises.exerciseId })
      .from(routineExercises)
      .innerJoin(routines, eq(routines.id, routineExercises.routineId))
      .where(eq(routines.userId, userId)),
    db
      .select({ exerciseId: entries.exerciseId, date: max(entries.date) })
      .from(entries)
      .where(eq(entries.userId, userId))
      .groupBy(entries.exerciseId),
  ]);
  const latestDate = new Map(latest.map((l) => [l.exerciseId, l.date]));
  return rows.map((routine) => ({
    ...routine,
    lastLogged: items
      .filter((item) => item.routineId === routine.id)
      .map((item) => latestDate.get(item.exerciseId) ?? null),
  }));
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
