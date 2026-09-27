"use server";

import { and, asc, eq, max, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { routineExercises, routines } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getExercise } from "@/lib/exercises";
import { getRoutine } from "@/lib/routines";

export type RoutineFormState = { error?: string };

function parseName(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  return name && name.length <= 40 ? name : null;
}

async function nameTaken(userId: string, name: string, exceptId?: number) {
  const [row] = await getDb()
    .select({ id: routines.id })
    .from(routines)
    .where(and(eq(routines.userId, userId), eq(sql`lower(${routines.name})`, name.toLowerCase())));
  return row !== undefined && row.id !== exceptId;
}

export async function createRoutine(
  _prev: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const user = await requireUser();
  const name = parseName(formData);
  if (!name) return { error: "Name must be 1–40 characters." };
  if (await nameTaken(user.id, name)) return { error: `You already have “${name}”.` };

  const db = getDb();
  const [{ last }] = await db
    .select({ last: max(routines.position) })
    .from(routines)
    .where(eq(routines.userId, user.id));
  const [created] = await db
    .insert(routines)
    .values({ userId: user.id, name, position: (last ?? -1) + 1 })
    .returning({ id: routines.id });

  // Straight into editing, to add exercises.
  redirect(`/routines/${created.id}/edit`);
}

export async function renameRoutine(
  routineId: number,
  _prev: RoutineFormState,
  formData: FormData,
): Promise<RoutineFormState> {
  const user = await requireUser();
  const name = parseName(formData);
  if (!name) return { error: "Name must be 1–40 characters." };
  if (await nameTaken(user.id, name, routineId)) return { error: `You already have “${name}”.` };

  await getDb()
    .update(routines)
    .set({ name })
    .where(and(eq(routines.id, routineId), eq(routines.userId, user.id)));
  refresh();
  return {};
}

export async function deleteRoutine(routineId: number) {
  const user = await requireUser();
  await getDb()
    .delete(routines)
    .where(and(eq(routines.id, routineId), eq(routines.userId, user.id)));
  redirect("/routines");
}

// Adds an exercise at the end of a routine. Does nothing if it's already in
// it, or if the routine or exercise isn't the user's.
export async function addToRoutine(routineId: number, exerciseId: number) {
  const user = await requireUser();
  const [routine, exercise] = await Promise.all([
    getRoutine(user.id, routineId),
    getExercise(user.id, exerciseId),
  ]);
  if (!routine || !exercise) return;

  const db = getDb();
  const [{ last }] = await db
    .select({ last: max(routineExercises.position) })
    .from(routineExercises)
    .where(eq(routineExercises.routineId, routineId));
  await db
    .insert(routineExercises)
    .values({ routineId, exerciseId, position: (last ?? -1) + 1 })
    .onConflictDoNothing();
  refresh();
}

export async function removeFromRoutine(routineId: number, exerciseId: number) {
  const user = await requireUser();
  if (!(await getRoutine(user.id, routineId))) return;
  await getDb()
    .delete(routineExercises)
    .where(and(eq(routineExercises.routineId, routineId), eq(routineExercises.exerciseId, exerciseId)));
  refresh();
}

// Swaps an exercise with its neighbour above (-1) or below (+1).
export async function moveInRoutine(routineId: number, exerciseId: number, direction: -1 | 1) {
  const user = await requireUser();
  if (!(await getRoutine(user.id, routineId))) return;

  const db = getDb();
  const items = await db
    .select({ exerciseId: routineExercises.exerciseId })
    .from(routineExercises)
    .where(eq(routineExercises.routineId, routineId))
    .orderBy(asc(routineExercises.position));
  const index = items.findIndex((i) => i.exerciseId === exerciseId);
  const other = items[index + direction];
  if (index === -1 || !other) return;

  // Rewrite every position so gaps or duplicates from earlier edits go away.
  const order = items.map((i) => i.exerciseId);
  [order[index], order[index + direction]] = [order[index + direction], order[index]];
  const updates = order.map((id, position) =>
    db
      .update(routineExercises)
      .set({ position })
      .where(and(eq(routineExercises.routineId, routineId), eq(routineExercises.exerciseId, id))),
  );
  await db.batch(updates as [(typeof updates)[number], ...typeof updates]);
  refresh();
}
