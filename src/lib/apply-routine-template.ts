// Creates a template's routines for a user. No "server-only" import, so the
// demo seed script can use it too.

import { and, eq, inArray, isNull, max } from "drizzle-orm";

import { getDb } from "@/db";
import { exercises, routineExercises, routines } from "@/db/schema";

import { type RoutineTemplate, uniqueName } from "./routine-templates";

export async function applyRoutineTemplate(userId: string, template: RoutineTemplate) {
  const db = getDb();
  const names = [...new Set(template.routines.flatMap((r) => r.exercises))];
  const [builtIns, existing, [{ last }]] = await Promise.all([
    db
      .select({ id: exercises.id, name: exercises.name })
      .from(exercises)
      .where(and(isNull(exercises.userId), inArray(exercises.name, names))),
    db.select({ name: routines.name }).from(routines).where(eq(routines.userId, userId)),
    db.select({ last: max(routines.position) }).from(routines).where(eq(routines.userId, userId)),
  ]);
  const exerciseId = new Map(builtIns.map((e) => [e.name, e.id]));
  const taken = existing.map((r) => r.name);
  let position = (last ?? -1) + 1;

  for (const routine of template.routines) {
    const name = uniqueName(routine.name, taken);
    taken.push(name);
    const [created] = await db
      .insert(routines)
      .values({ userId, name, position: position++ })
      .returning({ id: routines.id });
    const items = routine.exercises
      .filter((exercise) => exerciseId.has(exercise))
      .map((exercise, i) => ({ routineId: created.id, exerciseId: exerciseId.get(exercise)!, position: i }));
    if (items.length) await db.insert(routineExercises).values(items);
  }
}
