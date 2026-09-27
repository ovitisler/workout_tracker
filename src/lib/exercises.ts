import "server-only";

import { and, asc, eq, isNull, or, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { exercises } from "@/db/schema";

// Built-in exercises plus the user's own.
function visibleTo(userId: string) {
  return or(isNull(exercises.userId), eq(exercises.userId, userId));
}

const columns = {
  id: exercises.id,
  name: exercises.name,
  muscleGroup: exercises.muscleGroup,
  custom: sql<boolean>`${exercises.userId} is not null`,
};

export type Exercise = Awaited<ReturnType<typeof listExercises>>[number];

export function listExercises(userId: string) {
  return getDb()
    .select(columns)
    .from(exercises)
    .where(visibleTo(userId))
    .orderBy(asc(exercises.name));
}

// The exercise for an id from the URL, if it exists and the user can see it.
export async function getExerciseFromParam(
  userId: string,
  param: string | string[] | undefined,
) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? getExercise(userId, id) : undefined;
}

export async function getExercise(userId: string, id: number) {
  const [row] = await getDb()
    .select(columns)
    .from(exercises)
    .where(and(eq(exercises.id, id), visibleTo(userId)));
  return row;
}

export async function findExerciseByName(userId: string, name: string) {
  const [row] = await getDb()
    .select(columns)
    .from(exercises)
    .where(
      and(visibleTo(userId), eq(sql`lower(${exercises.name})`, name.toLowerCase())),
    );
  return row;
}
